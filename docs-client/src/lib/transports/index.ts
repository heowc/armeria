/*
 * Copyright 2018 LINE Corporation
 *
 * LINE Corporation licenses this file to you under the Apache License,
 * version 2.0 (the "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at:
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

import { Method, ServiceType } from '../specification';

import AnnotatedHttpTransport from './annotated-http';
import GrpcUnframedTransport from './grpc-unframed';
import ThriftTransport from './thrift';
import Transport from './transport';

const grpcUnframedTransport = new GrpcUnframedTransport();
const thriftTransport = new ThriftTransport();
const annotatedHttpTransport = new AnnotatedHttpTransport();

export class Transports {
  public getDebugTransport(
    serviceType: ServiceType,
    method: Method,
  ): Transport | undefined {
    const mimeTypes = new Set<string>();
    for (const endpoint of method.endpoints) {
      endpoint.availableMimeTypes.forEach((mimeType) =>
        mimeTypes.add(mimeType),
      );
    }
    for (const mimeType of mimeTypes) {
      if (grpcUnframedTransport.supports(serviceType, mimeType)) {
        return grpcUnframedTransport;
      }
      if (thriftTransport.supports(serviceType, mimeType)) {
        return thriftTransport;
      }
      if (annotatedHttpTransport.supports(serviceType, mimeType)) {
        return annotatedHttpTransport;
      }
    }
    return undefined;
  }
}

export const TRANSPORTS = new Transports();
