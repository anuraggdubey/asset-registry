#![cfg(test)]

use super::*;
use soroban_sdk::{Env, Symbol, testutils::Address as _};

#[test]
fn test_register_asset() {
    let env = Env::default();
    let contract_id = env.register(Registry, ());
    let client = RegistryClient::new(&env, &contract_id);

    let owner = soroban_sdk::Address::generate(&env);
    let id = Symbol::new(&env, "asset1");

    client.register(&id, &owner);

    assert_eq!(client.owner(&id), owner);
}

#[test]
fn test_transfer_by_owner() {
    let env = Env::default();
    let contract_id = env.register(Registry, ());
    let client = RegistryClient::new(&env, &contract_id);

    let owner1 = soroban_sdk::Address::generate(&env);
    let owner2 = soroban_sdk::Address::generate(&env);
    let id = Symbol::new(&env, "asset1");

    client.register(&id, &owner1);
    client.transfer(&id, &owner1, &owner2);

    assert_eq!(client.owner(&id), owner2);
}

#[test]
#[should_panic]
fn test_transfer_by_attacker_fails() {
    let env = Env::default();
    let contract_id = env.register(Registry, ());
    let client = RegistryClient::new(&env, &contract_id);

    let owner = soroban_sdk::Address::generate(&env);
    let attacker = soroban_sdk::Address::generate(&env);
    let new_owner = soroban_sdk::Address::generate(&env);
    let id = Symbol::new(&env, "asset1");

    client.register(&id, &owner);
    client.transfer(&id, &attacker, &new_owner);
}