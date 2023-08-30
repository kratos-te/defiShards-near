use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::serde_json::json;
use near_sdk::{
    env, ext_contract, near_bindgen, require, AccountId, Gas, PanicOnDefault, Promise,
    PromiseOrValue,
};
use near_contract_standards::fungible_token::receiver::FungibleTokenReceiver;

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct AssetArgs {
    token_id: String,
    token_contract_ids: Vec<AccountId>,
    token_amounts: Vec<U128>,
    token_deposited: Vec<bool>,
    near_amount: U128,
    near_deposited: bool,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    owner_id: AccountId,
    token_id: String,
    token_contract_ids: Vec<AccountId>,
    token_amounts: Vec<U128>,
    token_deposited: Vec<bool>,
    near_amount: U128,
    near_deposited: bool,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new(
        owner_id: AccountId,
        token_id: String,
        token_contract_ids: Vec<AccountId>,
        token_amounts: Vec<U128>,
        near_amount: U128,
    ) -> Self {
        require!(!env::state_exists(), "Already initialized");
        require!(
            token_contract_ids.len() == token_amounts.len(),
            "Token Spec input is invalid"
        );
        let mut deposited: Vec<bool> = vec![];
        for contract_id in &token_contract_ids {
            deposited.push(false);
        }
        Self {
            owner_id,
            token_id,
            token_contract_ids,
            token_amounts,
            token_deposited: deposited,
            near_amount: near_amount,
            near_deposited: false,
        }
    }

    pub fn get_info(&self) -> AssetArgs {
        let mut contract_ids = vec![];
        let mut amounts = vec![];
        let mut deposited = vec![];

        for i in 0..self.token_contract_ids.len() {
            contract_ids.push((*self.token_contract_ids.get(i).unwrap()).clone());
            amounts.push((*self.token_amounts.get(i).unwrap()).clone());
            deposited.push((*self.token_deposited.get(i).unwrap()).clone());
        }

        AssetArgs {
            token_id: String::from(self.token_id.clone()),
            token_contract_ids: contract_ids,
            token_amounts: amounts,
            token_deposited: deposited,
            near_amount: self.near_amount,
            near_deposited: self.near_deposited,
        }
    }

    pub fn release(&mut self, owner_id: AccountId) {
        assert_eq!(env::predecessor_account_id(), self.owner_id, "Unauthorized");

        if self.near_deposited {
            Promise::new(owner_id.clone()).transfer(u128::from(self.near_amount));
            self.near_deposited = false;
        }

        for i in 0..self.token_contract_ids.len() {
            if *self.token_deposited.get(i).unwrap() {
                Promise::new((*self.token_contract_ids.get(i).unwrap()).clone()).function_call(
                    "ft_transfer".to_string(),
                    json!({ "receiver_id": owner_id.clone(), "amount": *self.token_amounts.get(i).unwrap() })
                        .to_string()
                        .into_bytes(),
                    1.try_into().unwrap(),
                    Gas(60_000_000_000_000),
                );
                self.token_deposited.insert(i, false);
            }
        }

        Promise::new(env::current_account_id())
        .delete_account(owner_id);
    }

    #[payable]
    pub fn deposit_near(&mut self) {
        require!(
            self.near_amount != U128(0)
                && !self.near_deposited
                && u128::from(self.near_amount).checked_div(100).unwrap().checked_add(u128::from(self.near_amount)).unwrap() == env::attached_deposit(),
            "Can not accept Near Deposit"
        );
        Promise::new(self.owner_id.clone()).transfer(u128::from(self.near_amount).checked_div(100).unwrap());
        self.near_deposited = true;
    }
}

#[near_bindgen]
impl FungibleTokenReceiver for Contract {
    /// Called by fungible token contract after `ft_transfer_call` was initiated by
    /// `sender_id` of the given `amount` with the transfer message given in `msg` field.
    /// The `amount` of tokens were already transferred to this contract account and ready to be used.
    ///
    /// The method must return the amount of tokens that are *not* used/accepted by this contract from the transferred
    /// amount. Examples:
    /// - The transferred amount was `500`, the contract completely takes it and must return `0`.
    /// - The transferred amount was `500`, but this transfer call only needs `450` for the action passed in the `msg`
    ///   field, then the method must return `50`.
    /// - The transferred amount was `500`, but the action in `msg` field has expired and the transfer must be
    ///   cancelled. The method must return `500` or panic.
    ///
    /// Arguments:
    /// - `sender_id` - the account ID that initiated the transfer.
    /// - `amount` - the amount of tokens that were transferred to this account in a decimal string representation.
    /// - `msg` - a string message that was passed with this transfer call.
    ///
    /// Returns the amount of unused tokens that should be returned to sender, in a decimal string representation.
    fn ft_on_transfer(
        &mut self,
        sender_id: AccountId,
        amount: U128,
        msg: String,
    ) -> PromiseOrValue<U128> {
        let token_contract_id = env::predecessor_account_id();
        for i in 0..self.token_contract_ids.len() {
            if *self.token_contract_ids.get(i).unwrap() == token_contract_id {
                let require_amount = *self.token_amounts.get(i).unwrap();
                if *self.token_deposited.get(i).unwrap() == false && u128::from(require_amount).checked_div(100).unwrap().checked_add(u128::from(u128::from(self.near_amount).checked_div(100).unwrap().checked_add(u128::from(self.near_amount)).unwrap())).unwrap() == u128::from(amount) {
                    Promise::new((*self.token_contract_ids.get(i).unwrap()).clone()).function_call(
                        "ft_transfer".to_string(),
                        json!({ "receiver_id": self.owner_id.clone(), "amount": U128(u128::from(require_amount).checked_div(100).unwrap()) })
                            .to_string()
                            .into_bytes(),
                        1.try_into().unwrap(),
                        Gas(60_000_000_000_000),
                    );
                    self.token_deposited.insert(i, true);
                } else {
                    return PromiseOrValue::Value(amount);
                }
            }
        }
        PromiseOrValue::Value(U128(0))
    }
}
