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

import Transport from './transport';

export default class AnnotatedHttpTransport extends Transport {
  public serviceType(): ServiceType {
    return ServiceType.ANNOTATED;
  }

  public supports(serviceType: ServiceType): boolean {
    return serviceType === this.serviceType();
  }

  public setDebugMimeTypes(mimeTypes: Set<string>): void {
    this.mimeTypes = mimeTypes;
  }

  public getDebugMimeTypes(): Set<string> {
    if (this.mimeTypes.size <= 0) {
      throw new Error(`Mime type is empty.`);
    }
    return this.mimeTypes;
  }

  protected async doSend(
    method: Method,
    headers: { [name: string]: string },
    bodyString?: string,
    endpointPath?: string,
    queries?: string,
  ): Promise<string> {
    const hdrs = new Headers();
    for (const [name, value] of Object.entries(headers)) {
      hdrs.set(name, value);
    }

    if (!hdrs.has('content-type')) {
      throw new Error(`not setting for content-type`);
    }

    const endpoint = this.findDebugMimeTypeEndpoint(
      method,
      hdrs.get('content-type'),
    );

    let newPath;
    if (endpointPath) {
      newPath = endpointPath;
    } else {
      newPath = endpoint.pathMapping.substring('exact:'.length);
      if (queries && queries.length > 1) {
        if (queries.charAt(0) === '?') {
          newPath += queries;
        } else {
          newPath = `${newPath}?${queries}`;
        }
      }
    }
    const httpResponse = await fetch(encodeURI(newPath), {
      headers: hdrs,
      method: method.httpMethod,
      body: bodyString,
    });
    const response = await httpResponse.text();
    return response.length > 0 ? response : '&lt;zero-length response&gt;';
  }
}
