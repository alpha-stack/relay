/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayOSSContainerProxy
 * @flow
 */

'use strict';

import type {RelayContainer} from 'RelayTypes';

const REACT_STATICS = {
  childContextTypes: true,
  contextTypes: true,
  defaultProps: true,
  displayName: true,
  getDefaultProps: true,
  mixins: true,
  propTypes: true,
  type: true
};

const KNOWN_STATICS = {
  name: true,
  length: true,
  prototype: true,
  caller: true,
  arguments: true,
  arity: true
};

/**
 * This feature is deprecated and unavailable in open source.
 */
const RelayOSSContainerProxy = {
  proxyMethods(
    Container: RelayContainer,
    Component: ReactClass<any>
  ): void {
    if (typeof Component !== 'string') { // don't hoist over string (html) components
      const keys = Object.keys(Component);

      for (let i = 0; i < keys.length; ++i) {
        if (!REACT_STATICS[keys[i]] && !KNOWN_STATICS[keys[i]] && (!customStatics || !customStatics[keys[i]])) {
          try {
            Container[keys[i]] = Component[keys[i]];
          } catch (error) {

          }
        }
      }
    }

    return Container;
  },
};

module.exports = RelayOSSContainerProxy;
