## OCIリソースの準備

次の作業はrootコンパートメントのDefaultドメインで行う

1. ユーザーを作成
2. mope-blog-pullersグループを作成
3. 作成したユーザーをグループに追加
4. cci-group動的グループを作成\
   ルールは `ALL {resource.type='computecontainerinstance'}`
5. ポリシーを作成
   ```
   allow dynamic-group cci-group to read secret-bundles in tenancy
   allow group mope-blog-pullers to read repos in tenancy
   ```

作成したユーザーのユーザー名と認証トークンを Pulumi に設定する

## Dockerイメージのプッシュ

一度 `pulumi up` を実行する

1. 自身の認証トークンを取得
2. Pulumi により作成されたコンテナレジストリのドメインに `docker login`\
   ユーザー名: ネームスペース/OCIのユーザー名\
   パスワード: 認証トークン
