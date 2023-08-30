use crate::*;
use near_sdk::promise_result_as_success;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Bid {
    pub owner_id: AccountId,
    pub price: U128,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Sale {
    pub owner_id: AccountId,
    pub approval_id: u64,
    pub nft_contract_id: String,
    pub token_id: String,
    pub sale_conditions: SaleConditions,
    pub bids: Bids,
    pub created_at: U64,
    pub is_auction: bool,
    pub token_type: Option<String>,
}

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct PurchaseArgs {
    pub nft_contract_id: ValidAccountId,
    pub token_id: TokenId,
}

#[near_bindgen]
impl Contract {
    /// for add sale see: nft_callbacks.rs

    /// TODO remove without redirect to wallet? panic reverts
    #[payable]
    pub fn remove_sale(&mut self, nft_contract_id: ValidAccountId, token_id: String) {
        assert_one_yocto();
        let nft_contract = nft_contract_id.clone();
        let token = token_id.clone();
        let sale = self.internal_remove_sale(nft_contract_id.into(), token_id);
        let owner_id = env::predecessor_account_id();
        assert_eq!(owner_id, sale.owner_id, "Must be sale owner");
        self.refund_all_bids(&sale.bids);
        ext_contract::nft_transfer(
            owner_id.clone(),
            token,
            0,
            "return to user".to_string(),
            &nft_contract,
            1,
            GAS_FOR_NFT_TRANSFER,
        );
    }

    #[payable]
    pub fn update_price(
        &mut self,
        nft_contract_id: ValidAccountId,
        token_id: String,
        ft_token_id: ValidAccountId,
        price: U128,
    ) {
        assert_one_yocto();
        let contract_id: AccountId = nft_contract_id.into();
        let contract_and_token_id = format!("{}{}{}", contract_id, DELIMETER, token_id);
        let mut sale = self.sales.get(&contract_and_token_id).expect("No sale");
        assert_eq!(
            env::predecessor_account_id(),
            sale.owner_id,
            "Must be sale owner"
        );
        if !self.ft_token_ids.contains(ft_token_id.as_ref()) {
            env::panic(format!("Token {} not supported by this market", ft_token_id).as_bytes());
        }
        sale.sale_conditions.insert(ft_token_id.into(), price);
        self.sales.insert(&contract_and_token_id, &sale);
    }

    #[payable]
    pub fn offer(&mut self, nft_contract_id: ValidAccountId, token_id: String) {
        let contract_id: AccountId = nft_contract_id.into();
        let contract_and_token_id = format!("{}{}{}", contract_id, DELIMETER, token_id);
        let mut sale = self.sales.get(&contract_and_token_id).expect("No sale");
        let buyer_id = env::predecessor_account_id();
        assert_ne!(sale.owner_id, buyer_id, "Cannot bid on your own sale.");
        let ft_token_id = "near".to_string();
        let price = sale
            .sale_conditions
            .get(&ft_token_id)
            .expect("Not for sale in NEAR")
            .0;

        let deposit = env::attached_deposit();
        assert!(deposit > 0, "Attached deposit must be greater than 0");

        if !sale.is_auction && deposit == price.checked_add(price.checked_div(100).unwrap()).unwrap() {
            self.process_purchase(
                contract_id,
                token_id,
                ft_token_id,
                U128(deposit),
                buyer_id,
                sale.owner_id.clone()
            );
        } else {
            if sale.is_auction && price > 0 {
                assert!(deposit <= price, "Attached deposit must be lesser than reserve price");
            }

            if deposit == price {
                self.process_purchase(
                    contract_id,
                    token_id,
                    ft_token_id,
                    U128(deposit),
                    buyer_id,
                    sale.owner_id.clone()
                );
            } else {
                self.add_bid(
                    contract_and_token_id,
                    deposit,
                    ft_token_id,
                    buyer_id,
                    &mut sale,
                );
            }
        }
    }

    #[private]
    pub fn add_bid(
        &mut self,
        contract_and_token_id: ContractAndTokenId,
        amount: Balance,
        ft_token_id: AccountId,
        buyer_id: AccountId,
        sale: &mut Sale,
    ) {
        // store a bid and refund any current bid lower
        let new_bid = Bid {
            owner_id: buyer_id,
            price: U128(amount),
        };
        
        let bids_for_token_id = sale.bids.entry(ft_token_id.clone()).or_insert_with(Vec::new);
        
        if !bids_for_token_id.is_empty() {
            let current_bid = &bids_for_token_id[bids_for_token_id.len()-1];
            assert!(
                amount > current_bid.price.0,
                "Can't pay less than or equal to current bid price: {}",
                current_bid.price.0
            );
            if ft_token_id == "near" {
                Promise::new(current_bid.owner_id.clone()).transfer(u128::from(current_bid.price));
            } else {
                ext_contract::ft_transfer(
                    current_bid.owner_id.clone(),
                    current_bid.price,
                    None,
                    &ft_token_id,
                    1,
                    GAS_FOR_FT_TRANSFER,
                );
            }
        }
        
        bids_for_token_id.push(new_bid);
        if bids_for_token_id.len() > self.bid_history_length as usize {
            bids_for_token_id.remove(0);
        }
        
        self.sales.insert(&contract_and_token_id, &sale);
    }

    pub fn accept_offer(
        &mut self,
        nft_contract_id: ValidAccountId,
        token_id: String,
        ft_token_id: ValidAccountId,
    ) {
        let contract_id: AccountId = nft_contract_id.into();
        let contract_and_token_id = format!("{}{}{}", contract_id.clone(), DELIMETER, token_id.clone());
        // remove bid before proceeding to process purchase
        let mut sale = self.sales.get(&contract_and_token_id).expect("No sale");
        let bids_for_token_id = sale.bids.remove(ft_token_id.as_ref()).expect("No bids");
        let bid = &bids_for_token_id[bids_for_token_id.len()-1];
        let owner_id = sale.owner_id.clone();
	assert!(
		env::current_account_id() == owner_id.clone(),
		"Invalid Authorization"
	);
    	self.sales.insert(&contract_and_token_id, &sale);
        // panics at `self.internal_remove_sale` and reverts above if predecessor is not sale.owner_id
        self.process_purchase(
            contract_id,
            token_id,
            ft_token_id.into(),
            bid.price,
            bid.owner_id.clone(),
            owner_id,
        );
    }

    #[private]
    pub fn process_purchase(
        &mut self,
        nft_contract_id: AccountId,
        token_id: String,
        ft_token_id: AccountId,
        price: U128,
        buyer_id: AccountId,
        owner_id: AccountId
    ) -> Promise {
        let sale = self.internal_remove_sale(nft_contract_id.clone(), token_id.clone());

        ext_contract::nft_transfer(
            buyer_id.clone(),
            token_id,
            sale.approval_id,
            "payout from market".to_string(),
            &nft_contract_id,
            1,
            GAS_FOR_NFT_TRANSFER,
        );

        Promise::new(owner_id.clone()).transfer(u128::from(price))
    }

    /// self callback

    #[private]
    pub fn resolve_purchase(
        &mut self,
        ft_token_id: AccountId,
        buyer_id: AccountId,
        sale: Sale,
        price: U128,
        owner_id: AccountId,
    ) -> U128 {
        let marketplace_id = env::current_account_id();
        // checking for payout information
        let payout_option = promise_result_as_success().and_then(|value| {
            // None means a bad payout from bad NFT contract
            near_sdk::serde_json::from_slice::<Payout>(&value)
                .ok()
                .and_then(|payout| {
                    // gas to do 10 FT transfers (and definitely 10 NEAR transfers)
                    if payout.payout.len() + sale.bids.len() > 10 || payout.payout.is_empty() {
                        env::log(format!("Cannot have more than 10 royalties and sale.bids refunds").as_bytes());
                        None
                    } else {
                        // TODO off by 1 e.g. payouts are fractions of 3333 + 3333 + 3333
                        let mut remainder = price.0;
                        for &value in payout.payout.values() {
                            remainder = remainder.checked_sub(value.0)?;
                        }
                        if remainder == 0 || remainder == 1 {
                            Some(payout)
                        } else {
                            None
                        }
                    }
                })
        });
        
        // is payout option valid?
        let payout = if let Some(payout_option) = payout_option {
            payout_option
        } else {
            if ft_token_id == "near" {
                Promise::new(owner_id).transfer(u128::from(price));
            }
            // leave function and return all FTs in ft_resolve_transfer
            return price;
        };
        // Going to payout everyone, first return all outstanding bids (accepted offer bid was already removed)
        self.refund_all_bids(&sale.bids);

        // NEAR payouts
        if ft_token_id == "near" {
            for (receiver_id, amount) in payout.payout {
                if receiver_id == marketplace_id{
                    Promise::new(owner_id.clone()).transfer(amount.0);
                } else {
                    Promise::new(receiver_id).transfer(amount.0);
                }
            }
            // refund all FTs (won't be any)
            price
        } else {
            // FT payouts
            for (receiver_id, amount) in payout.payout {
                if receiver_id == marketplace_id{
                    ext_contract::ft_transfer(
                        owner_id.clone(),
                        amount,
                        None,
                        &ft_token_id,
                        1,
                        GAS_FOR_FT_TRANSFER,
                    );
                } else {
                    ext_contract::ft_transfer(
                        receiver_id,
                        amount,
                        None,
                        &ft_token_id,
                        1,
                        GAS_FOR_FT_TRANSFER,
                    );
                }
            }
            // keep all FTs (already transferred for payouts)
            U128(0)
        }
    }
}

/// self call

#[ext_contract(ext_self)]
trait ExtSelf {
    fn resolve_purchase(
        &mut self,
        ft_token_id: AccountId,
        buyer_id: AccountId,
        sale: Sale,
        price: U128,
        owner_id: AccountId,
    ) -> Promise;
}
