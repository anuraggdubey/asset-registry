#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Env, String};

#[test]
fn test_register_asset() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Registry, ());
    let client = RegistryClient::new(&env, &contract_id);

    let owner = soroban_sdk::Address::generate(&env);
    let id = String::from_str(&env, "asset1");

    client.register(&id, &owner);

    assert_eq!(client.owner(&id), owner);
}

#[test]
fn test_transfer_by_owner() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Registry, ());
    let client = RegistryClient::new(&env, &contract_id);

    let owner1 = soroban_sdk::Address::generate(&env);
    let owner2 = soroban_sdk::Address::generate(&env);
    let id = String::from_str(&env, "asset1");

    client.register(&id, &owner1);
    client.transfer(&id, &owner2);

    assert_eq!(client.owner(&id), owner2);
}
