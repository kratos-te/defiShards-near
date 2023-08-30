import { Contract } from "near-api-js";


export class ContractFactory<T> {
  private values: Map<string, Contract>;
  private action: (contract: Contract) => T;

  constructor(values: Map<string, Contract>, action: (contract: Contract) => T) {
    this.values = values;
    this.action = action;
  }

  get = (contractId: string) => this.values.has(contractId) ? this.action(this.values.get(contractId)!) : null;

  contracts = () => Array.from(this.values.keys());

  getAll = () => this.contracts().map(contractId => this.action(this.values.get(contractId)!));
}