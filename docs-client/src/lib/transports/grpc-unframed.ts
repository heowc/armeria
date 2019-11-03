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

import jsonPrettify from '../json-prettify';
import { Method, ServiceType } from '../specification';

import Transport from './transport';

export default class GrpcUnframedTransport extends Transport {
  public serviceType(): ServiceType {
    return ServiceType.GRPC;
  }

  public supports(serviceType: ServiceType): boolean {
    return serviceType === this.serviceType();
  }

  public setDebugMimeTypes(mimeTypes: Set<string>): void {
    this.mimeTypes = mimeTypes;
  }

  public getDebugMimeTypes(): Set<string> {
    return this.mimeTypes;
  }

  protected async doSend(
    method: Method,
    headers: { [name: string]: string },
    bodyJson?: string,
  ): Promise<string> {
    if (!bodyJson) {
      throw new Error('A gRPC request must have body.');
    }

    const hdrs = new Headers();
    for (const [name, value] of Object.entries(headers)) {
      hdrs.set(name, value);
    }

    const endpoint = this.findDebugMimeTypeEndpoint(
      method,
      hdrs.get('content-type'),
    );

    const httpResponse = await fetch(endpoint.pathMapping, {
      headers: hdrs,
      method: 'POST',
      body: bodyJson,
    });
    const contentType = httpResponse.headers.get('content-type');
    const text = await httpResponse.text();
    if (contentType && contentType.startsWith('application/json')) {
      return jsonPrettify(text);
    }
    return text;
  }
}
