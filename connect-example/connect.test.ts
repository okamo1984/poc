import { createPromiseClient } from '@bufbuild/connect'
import { describe, it, expect } from 'vitest'
import { BigIntService } from './gen/count_connect.js'
import { mockBigIntTransport } from './mock.js'

describe('your clinet test suite', () => {
    it('test a simple client call', async () => {
        const client = createPromiseClient(BigIntService, mockBigIntTransport())
        const { count } = await client.count({})
        expect(count).toBe(1n)
    })
})