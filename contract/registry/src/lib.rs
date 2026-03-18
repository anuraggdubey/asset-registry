#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};

#[contract]
pub struct Registry;

#[contracttype]
#[derive(Clone)]
pub struct Asset {
    pub owner: Address,
}

#[contractimpl]
impl Registry {
    pub fn register(env: Env, id: String, owner: Address) {
        owner.require_auth();
        if env.storage().instance().has(&id) {
            panic!("asset already registered");
        }
        env.storage().instance().set(&id, &Asset { owner });
    }

    pub fn transfer(env: Env, id: String, to: Address) {
        let mut asset: Asset = env.storage().instance().get(&id).unwrap();
        asset.owner.require_auth();
        asset.owner = to;
        env.storage().instance().set(&id, &asset);
    }

    pub fn owner(env: Env, id: String) -> Address {
        let asset: Asset = env.storage().instance().get(&id).unwrap();
        asset.owner
    }
}

mod test;
