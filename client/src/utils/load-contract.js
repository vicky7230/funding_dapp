import contract from "@truffle/contract"


export const loadContract = async (name, provider) => {
    const artifact = require(`../../../build/contracts/${name}.json`)
    const _contract = contract(artifact)
    _contract.setProvider(provider)
    return await _contract.deployed();
}