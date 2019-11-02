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

export const ANNOTATED_HTTP_MIME_TYPES = [
  'application/json; charset=utf-8',
  'application/x-www-form-urlencoded',
];

export default class AnnotatedHttpTransport extends Transport {
  public serviceType(): ServiceType {
    return ServiceType.ANNOTATED;
  }

  public supports(serviceType: ServiceType): boolean {
    return serviceType === this.serviceType();
  }

  public supportsMimeType(mimeType: string): boolean {
    return ANNOTATED_HTTP_MIME_TYPES.indexOf(mimeType) > -1;
  }

  public getDebugMimeType(): string {
    return ANNOTATED_HTTP_MIME_TYPES[0];
  }

  protected async doSend(
    method: Method,
    headers: { [name: string]: string },
    bodyJson?: string,
    endpointPath?: string,
    queries?: string,
  ): Promise<string> {
    const endpoint = this.findDebugMimeTypeEndpoint(method);

    const hdrs = new Headers();
    for (const [name, value] of Object.entries(headers)) {
      hdrs.set(name, value);
    }
    const hasContentType = hdrs.has('content-type');
    if (!hasContentType) {
      hdrs.set('content-type', endpoint.availableMimeTypes[0]);
    }

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
      body: bodyJson,
    });
    const response = await httpResponse.text();
    return response.length > 0 ? response : '&lt;zero-length response&gt;';
  }
}
