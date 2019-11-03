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

import { Endpoint, Method, ServiceType } from '../specification';

import Transport from './transport';

export default class ThriftTransport extends Transport {
  private static thriftMethod(endpoint: Endpoint, method: Method) {
    return endpoint.fragment
      ? `${endpoint.fragment}:${method.name}`
      : method.name;
  }
  public serviceType(): ServiceType {
    return ServiceType.THRIFT;
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

  public getCurlBody(endpoint: Endpoint, method: Method, body: string): string {
    const thriftMethod = ThriftTransport.thriftMethod(endpoint, method);
    return `{"method":"${thriftMethod}", "type": "CALL", "args": ${body}}`;
  }

  protected async doSend(
    method: Method,
    headers: { [name: string]: string },
    bodyJson?: string,
  ): Promise<string> {
    if (!bodyJson) {
      throw new Error('A Thrift request must have body.');
    }

    const hdrs = new Headers();
    for (const [name, value] of Object.entries(headers)) {
      hdrs.set(name, value);
    }

    const endpoint = this.findDebugMimeTypeEndpoint(
      method,
      hdrs.get('content-type'),
    );

    const thriftMethod = ThriftTransport.thriftMethod(endpoint, method);

    const httpResponse = await fetch(endpoint.pathMapping, {
      headers: hdrs,
      method: 'POST',
      body: `{"method": "${thriftMethod}", "type": "CALL", "args": ${bodyJson}}`,
    });
    const response = await httpResponse.text();
    return response.length > 0 ? response : 'Request sent to one-way function';
  }
}
