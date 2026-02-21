#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Env, Symbol, Address};

#[contract]
pub struct Registry;

#[contracttype]
#[derive(Clone)]
pub struct Asset {
    pub owner: Address,
}

#[contractimpl]
impl Registry {

    // register a new asset
    pub fn register(env: Env, id: Symbol, owner: Address) {
        if env.storage().instance().has(&id) {
            panic!("asset already registered");
        }
        env.storage().instance().set(&id, &Asset { owner });
    }

    // transfer ownership
    pub fn transfer(env: Env, id: Symbol, from: Address, to: Address) {
        let mut asset: Asset = env.storage().instance().get(&id).unwrap();

        if asset.owner != from {
            panic!("not owner");
        }

        asset.owner = to;
        env.storage().instance().set(&id, &asset);
    }

    // get owner
    pub fn owner(env: Env, id: Symbol) -> Address {
        let asset: Asset = env.storage().instance().get(&id).unwrap();
        asset.owner
    }
}

mod test;