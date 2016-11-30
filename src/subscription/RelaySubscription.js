/* @flow */

import invariant from 'invariant';
import RelayEnvironment from 'RelayEnvironment';
import RelayMutation from 'RelayMutation';
import RelayMetaRoute from 'RelayMetaRoute';

import type {
  MutationConfig,
  RelayConcreteNode,
  Variables,
} from './types';

class Subscription<Tp: Object> {
  static name: string;
  static initialVariables: Variables;
  static prepareVariables: ?(
    prevVariables: Variables,
    route: RelayMetaRoute
  ) => Variables;

  props: Tp;
  _unresolvedProps: Tp;
  _environment: RelayEnvironment;
  _didShowFakeDataWarning: boolean;
  _didValidateConfig: boolean;

  constructor(props: Tp) {
    this._didShowFakeDataWarning = false;
    this._didValidateConfig = false;
    this._unresolvedProps = props;
  }

  static getFragment(fragmentName: string, variableMapping): any {
    return RelayMutation.getFragment.call(
      this,
      fragmentName,
      variableMapping
    );
  }

  bindEnvironment(environment: RelayEnvironment): void {
    RelayMutation.prototype.bindEnvironment.call(this, environment);
  }

  getSubscription(): RelayConcreteNode {
    invariant(
      false,
      '%s: Expected abstract method `getSubscription` to be implemented',
      this.constructor.name
    );
  }

  getConfigs(): Array<MutationConfig> {
    invariant(
      false,
      '%s: Expected abstract method `getConfigs` to be implemented',
      this.constructor.name
    );
  }

  getVariables(): Variables {
    invariant(
      false,
      '%s: Expected abstract method `getVariables` to be implemented',
      this.constructor.name
    );
  }

  _resolveProps(): void {
    RelayMutation.prototype._resolveProps.call(this);
  }
}

module.exports = Subscription;
