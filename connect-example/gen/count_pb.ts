// @generated by protoc-gen-es v1.2.1 with parameter "target=ts"
// @generated from file count.proto (package buf.connect.demo.count.v1, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3, protoInt64 } from "@bufbuild/protobuf";

/**
 * @generated from message buf.connect.demo.count.v1.CountRequest
 */
export class CountRequest extends Message<CountRequest> {
  /**
   * @generated from field: int64 add = 1;
   */
  add = protoInt64.zero;

  constructor(data?: PartialMessage<CountRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "buf.connect.demo.count.v1.CountRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "add", kind: "scalar", T: 3 /* ScalarType.INT64 */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): CountRequest {
    return new CountRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): CountRequest {
    return new CountRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): CountRequest {
    return new CountRequest().fromJsonString(jsonString, options);
  }

  static equals(a: CountRequest | PlainMessage<CountRequest> | undefined, b: CountRequest | PlainMessage<CountRequest> | undefined): boolean {
    return proto3.util.equals(CountRequest, a, b);
  }
}

/**
 * @generated from message buf.connect.demo.count.v1.CountResponse
 */
export class CountResponse extends Message<CountResponse> {
  /**
   * @generated from field: int64 count = 1;
   */
  count = protoInt64.zero;

  constructor(data?: PartialMessage<CountResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "buf.connect.demo.count.v1.CountResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "count", kind: "scalar", T: 3 /* ScalarType.INT64 */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): CountResponse {
    return new CountResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): CountResponse {
    return new CountResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): CountResponse {
    return new CountResponse().fromJsonString(jsonString, options);
  }

  static equals(a: CountResponse | PlainMessage<CountResponse> | undefined, b: CountResponse | PlainMessage<CountResponse> | undefined): boolean {
    return proto3.util.equals(CountResponse, a, b);
  }
}
