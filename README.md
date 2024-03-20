# CF Shares Token Subgraph

This Subgraph sources transfer event from the CF SharesToken contract in different networks.

## Deploying the subgraph:

**First time only**
```ssh
yarn install
```

Available networks: linea

**Linea deployment**

Linea is not index by The Graph so we use Goldsky

First run:

```ssh
goldsky login
```

If you already have an existing Linea subgraph you will have to delete it to deploy the new one

**Deploy**

<!-- ```
--product hosted-service --access-token {TOKEN}
```
as extra parameters just after "graph deploy" in the package json and then execute the following: -->

```ssh
yarn prepare:<network>
yarn codegen
yarn build
yarn deploy:<network>
```
