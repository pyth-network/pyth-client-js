import { PublicKey } from '@solana/web3.js'
import { AccountType, Magic, parsePermissionData, Version } from '../index'

test('Parse permission account', (done) => {
  jest.setTimeout(60000)

  const data = Buffer.from(
    '1MOyoQIAAAAFAAAAcAAAAImry8+SSJfg5VrdIcyH2oRAsza674wsCWWahgc9QNtMMagMxzMOceCCHTfo6+fDdV+hjbfjevgN0nX2y65Rbw59wrxBgcqYAgQ5yOFn8V1OQYvW2z+qvPSyoctqLEwjMg==',
    'base64',
  )
  const permission = parsePermissionData(data)
  expect(permission.magic).toBe(Magic)
  expect(permission.version).toBe(Version)
  expect(permission.type).toBe(AccountType.Permission)
  expect(permission.size).toBe(16 + 32 * 3)
  expect(permission.masterAuthority.equals(new PublicKey('AGQnwBFJ3WwWXqjkaeDKYkU3tJFi8cMkCCevQeLUYSf5'))).toBeTruthy()
  expect(
    permission.dataCurationAuthority.equals(new PublicKey('4Lqbt4kQYjc5TxQiyRiLKi9rvizU4VRiXUpzEBkZLbid')),
  ).toBeTruthy()
  expect(
    permission.securityAuthority.equals(new PublicKey('9TvBred1G7eFo8E16MEK4LxHP11XEMqxkdmZ84WtaUau')),
  ).toBeTruthy()
  done()
})
