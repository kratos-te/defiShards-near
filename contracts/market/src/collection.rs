use crate::*;
use near_sdk::promise_result_as_success;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct CollectionLinks {
    pub discord: String,
    pub twitter: String,
    pub website: String,
    pub telegram: String,
    pub instagram: String,
    pub medium: String,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct CollectionInfo {
    pub nft_contract_id: AccountId,
    pub token_type: String,
    pub name: String,
    pub isVerified: bool,
    pub bannerImageUrl: String,
    pub profileImageUrl: String,
    pub description: String,
    pub royalty: u64,
    pub updated_at: U64,
    pub links: CollectionLinks,
}

#[near_bindgen]
impl Contract {
    /// for add sale see: nft_callbacks.rs

    /// TODO remove without redirect to wallet? panic reverts
    #[payable]
    pub fn add_collection(&mut self,
        nft_contract_id: AccountId,
        token_type: String,
        name: String,
        isVerified: bool,
        bannerImageUrl: String,
        profileImageUrl: String,
        description: String,
        royalty: u64,
        discord: String,
        twitter: String,
        website: String,
        telegram: String,
        instagram: String,
        medium: String,
    ) {
        self.assert_manager();
        let nft_contract: AccountId = nft_contract_id.clone();
        let newCollection = CollectionInfo {
            name: name,
            isVerified: isVerified,
            bannerImageUrl: bannerImageUrl,
            profileImageUrl: profileImageUrl,
            description: description,
            royalty: royalty,
            nft_contract_id: nft_contract.clone(),
            token_type: token_type.clone(),
            updated_at: U64(env::block_timestamp()/1000000),
            links: CollectionLinks {
                discord: discord,
                twitter: twitter,
                website: website,
                telegram: telegram,
                instagram: instagram,
                medium: medium,
            },
        };
        let contract_and_token_type = format!("{}{}{}", nft_contract, DELIMETER, token_type);
        self.collections.insert(
            &contract_and_token_type,
            &newCollection);
    }

    #[payable]
    pub fn edit_collection(&mut self,
        nft_contract_id: AccountId,
        token_type: String,
        name: String,
        isVerified: bool,
        bannerImageUrl: String,
        profileImageUrl: String,
        description: String,
        royalty: u64,
        discord: String,
        twitter: String,
        website: String,
        telegram: String,
        instagram: String,
        medium: String,
    ) {
        self.assert_manager();
        let nft_contract: AccountId = nft_contract_id.clone();
        let newCollection = CollectionInfo {
            name: name,
            isVerified: isVerified,
            bannerImageUrl: bannerImageUrl,
            profileImageUrl: profileImageUrl,
            description: description,
            royalty: royalty,
            nft_contract_id: nft_contract.clone(),
            token_type: token_type.clone(),
            updated_at: U64(env::block_timestamp()/1000000),
            links: CollectionLinks {
                discord: discord,
                twitter: twitter,
                website: website,
                telegram: telegram,
                instagram: instagram,
                medium: medium,
            },
        };
        let contract_and_token_type = format!("{}{}{}", nft_contract, DELIMETER, token_type);
        self.collections.insert(
            &contract_and_token_type,
            &newCollection);
    }

    pub fn get_collections(
        &self
    ) -> Vec<(ContractAndTokenType, CollectionInfo)> {
        let tmp = self.collections.to_vec();
        tmp
    }

    pub fn get_collection(&self,
        nft_contract_id: AccountId,
        token_type: String) -> CollectionInfo{
        let nft_contract: AccountId = nft_contract_id.clone();
        let contract_and_token_type = format!("{}{}{}", nft_contract, DELIMETER, token_type);
        let temp = self.collections.get(&contract_and_token_type).unwrap();
        temp
    }
    
    #[payable]
    pub fn delete_collection(&mut self,
        nft_contract_id: AccountId,
        token_type: String
    ) {
        self.assert_manager();
        let nft_contract: AccountId = nft_contract_id.clone();
        let contract_and_token_type = format!("{}{}{}", nft_contract, DELIMETER, token_type);
        self.collections.remove(&contract_and_token_type);
    }
}
