# Tools

39 tools: 23 are always on, and 16 are off until you set `NOMBA_ENABLE_SENSITIVE_TOOLS=true` (see [security.md](security.md)). The table marks which is which.

Every tool carries MCP annotations (`readOnlyHint`, `destructiveHint`, `openWorldHint`) so clients can ask for confirmation. List and filter tools take paging arguments; check the response for more pages before treating a list as complete.

Each endpoint is pinned to Nomba's [API reference](https://developer.nomba.com/nomba-api-reference/introduction) by `src/tools/endpoints.test.ts`.

### Accounts & Terminals (5 tools)

| Tool | Needs `NOMBA_ENABLE_SENSITIVE_TOOLS` | Description | API endpoint |
|------|-------|-------------|----------|
| `nomba_get_parent_account` | No | Fetch the parent account details for the authenticated Nomba business. | `GET /v1/accounts/parent` |
| `nomba_get_parent_balance` | No | Fetch the current balance of the parent Nomba business account. | `GET /v1/accounts/balance` |
| `nomba_list_terminals` | No | List POS terminals assigned to the parent Nomba account. | `GET /v1/accounts/terminals` |
| `nomba_assign_terminal` | Yes | Assign a POS terminal to the parent Nomba account using its serial number. | `POST /v1/terminals/assign` |
| `nomba_unassign_terminal` | Yes | Unassign a POS terminal from the parent Nomba account using its serial number. | `POST /v1/terminals/unassign` |

### Sub-Accounts (3 tools)

| Tool | Needs `NOMBA_ENABLE_SENSITIVE_TOOLS` | Description | API endpoint |
|------|-------|-------------|----------|
| `nomba_get_sub_account` | No | Fetch details of a sub-account by the accountRef it was created with. | `GET /v1/accounts/sub-account-details` |
| `nomba_get_sub_account_balance` | No | Fetch the current balance of a specific sub-account. | `GET /v1/accounts/{accountId}/balance` |
| `nomba_list_sub_account_terminals` | No | List POS terminals assigned to a sub-account. | `GET /v1/accounts/{accountId}/terminals` |

### Transfers (4 tools)

| Tool | Needs `NOMBA_ENABLE_SENSITIVE_TOOLS` | Description | API endpoint |
|------|-------|-------------|----------|
| `nomba_list_banks` | No | Fetch the list of all Nigerian bank codes and names. | `GET /v1/transfers/banks` |
| `nomba_lookup_bank_account` | No | Validate a bank account by looking up the account holder's name. | `POST /v1/transfers/bank/lookup` |
| `nomba_transfer_to_bank` | Yes | Transfer funds from the parent Nomba account to an external Nigerian bank account. | `POST /v2/transfers/bank` |
| `nomba_transfer_between_accounts` | Yes | Transfer funds from the parent account to another Nomba account (wallet/P2P transfer). | `POST /v2/transfers/wallet` |

### Online Checkout (5 tools)

| Tool | Needs `NOMBA_ENABLE_SENSITIVE_TOOLS` | Description | API endpoint |
|------|-------|-------------|----------|
| `nomba_create_checkout_order` | Yes | Create a checkout payment order and get a payment link (checkoutLink). | `POST /v1/checkout/order` |
| `nomba_charge_tokenized_card` | Yes | Charge a previously saved/tokenized card. | `POST /v1/checkout/tokenized-card-payment` |
| `nomba_refund_transaction` | Yes | Process a refund for a completed checkout transaction. | `POST /v1/checkout/refund` |
| `nomba_get_checkout_transaction` | No | Retrieve the details and status of a checkout transaction by its order reference. | `GET /v1/checkout/transaction` |
| `nomba_cancel_transaction` | Yes | Cancel an incomplete or pending checkout order. | `POST /v1/checkout/order/cancel` |

### Virtual Accounts (5 tools)

| Tool | Needs `NOMBA_ENABLE_SENSITIVE_TOOLS` | Description | API endpoint |
|------|-------|-------------|----------|
| `nomba_create_virtual_account` | Yes | Create a new virtual bank account under the parent Nomba account. | `POST /v1/accounts/virtual` |
| `nomba_get_virtual_account` | No | Fetch details of a specific virtual account by its accountRef or bank account number. | `GET /v1/accounts/virtual/{identifier}` |
| `nomba_update_virtual_account` | Yes | Update an existing virtual account's name, reference, or expected amount. | `PUT /v1/accounts/virtual/{identifier}` |
| `nomba_expire_virtual_account` | Yes | Expire/deactivate a virtual account so it can no longer receive payments. | `DELETE /v1/accounts/virtual/{identifier}` |
| `nomba_list_virtual_accounts` | No | List or filter virtual accounts under the parent Nomba account. | `POST /v1/accounts/virtual/list` |

### Transactions (4 tools)

| Tool | Needs `NOMBA_ENABLE_SENSITIVE_TOOLS` | Description | API endpoint |
|------|-------|-------------|----------|
| `nomba_list_bank_transactions` | No | Fetch credit/debit (bank) transactions for the parent Nomba account. | `GET /v1/transactions/bank` |
| `nomba_requery_transaction` | No | Confirm the status of a transaction using its session ID. | `GET /v1/transactions/requery/{sessionId}` |
| `nomba_get_transaction` | No | Fetch a single transaction on the parent account by its Nomba transaction reference or your merchantTxRef. | `GET /v1/transactions/accounts/single` |
| `nomba_filter_transactions` | No | List or filter transactions on the parent account by status, type, source, terminal or reference, with date range and pagination. | `POST /v1/transactions/accounts` |

### Bills - Electricity (3 tools)

| Tool | Needs `NOMBA_ENABLE_SENSITIVE_TOOLS` | Description | API endpoint |
|------|-------|-------------|----------|
| `nomba_get_electricity_providers` | No | Fetch the list of available electricity distribution companies (DisCos). | `GET /v1/bill/electricity/discos` |
| `nomba_lookup_electricity_customer` | No | Validate an electricity meter number and get the customer's name. | `GET /v2/bill/electricity/lookup` |
| `nomba_buy_electricity` | Yes | Purchase electricity tokens for a prepaid meter or pay a postpaid electricity bill. | `POST /v2/bill/electricity` |

### Bills - Cable TV (4 tools)

| Tool | Needs `NOMBA_ENABLE_SENSITIVE_TOOLS` | Description | API endpoint |
|------|-------|-------------|----------|
| `nomba_get_cable_providers` | No | List the supported cable TV providers (DSTV, GOtv, Startimes, Showmax). | none (fixed list) |
| `nomba_list_cable_plans` | No | Fetch the subscription plans (bouquets) and prices for a cable TV provider. | `GET /v1/bill/cableTvProduct` |
| `nomba_lookup_cable_customer` | No | Validate a cable TV smartcard/IUC number and get the customer's name. | `GET /v1/bill/cabletv/lookup` |
| `nomba_pay_cable_subscription` | Yes | Pay for a cable TV subscription (DSTV, GOtv, Startimes, Showmax). | `POST /v2/bill/cabletv` |

### Bills - Betting (3 tools)

| Tool | Needs `NOMBA_ENABLE_SENSITIVE_TOOLS` | Description | API endpoint |
|------|-------|-------------|----------|
| `nomba_get_betting_providers` | No | Fetch the list of available betting platforms. | `GET /v1/bill/betting/providers` |
| `nomba_lookup_betting_customer` | No | Validate a betting account and get the customer's name. | `GET /v1/bill/betting/lookup` |
| `nomba_fund_betting_account` | Yes | Fund a customer's betting account on a supported betting platform. | `POST /v2/bill/betting` |

### Airtime & Data (3 tools)

| Tool | Needs `NOMBA_ENABLE_SENSITIVE_TOOLS` | Description | API endpoint |
|------|-------|-------------|----------|
| `nomba_buy_airtime` | Yes | Purchase airtime/credit for a Nigerian phone number from the parent account. | `POST /v2/bill/topup` |
| `nomba_list_data_plans` | No | Fetch available data bundle plans for a network provider. | `GET /v1/bill/data-plan/{network}` |
| `nomba_buy_data` | Yes | Purchase a data bundle for a Nigerian phone number. | `POST /v2/bill/data` |

## Resource

`nomba://banks` is the Nigerian bank code list, fetched once and cached for 24 hours. Reading it avoids repeat calls to `nomba_list_banks`.

## Example prompts

- "What's my Nomba account balance?"
- "Show me my last 10 transactions."
- "Look up account 0123456789 at Access Bank."
- With sensitive tools on: "Buy 1000 Naira airtime for 08012345678." or "Transfer 5000 Naira to account 0123456789 at GTBank."
