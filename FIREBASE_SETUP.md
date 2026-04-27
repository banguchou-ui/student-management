# Firebase 接続手順

## 1. Firebase プロジェクト作成

1. https://firebase.google.com にアクセス
2. Google アカウントでログイン
3. 「プロジェクトを作成」をクリック
4. プロジェクト名: 例 `student-manager-yourschool`
5. Google Analytics: OFF でOK
6. 「プロジェクトを作成」

---

## 2. Authentication の有効化

1. 左メニュー → 「Authentication」
2. 「始める」をクリック
3. 「Sign-in method」タブ
4. 「メール/パスワード」を有効にする

---

## 3. Firestore Database の作成

1. 左メニュー → 「Firestore Database」
2. 「データベースの作成」をクリック
3. 「本番環境モード」を選択（後でルールを設定）
4. ロケーション: `asia-northeast1`（東京）を選択
5. 「有効にする」

---

## 4. セキュリティルールの設定

Firestore → 「ルール」タブに以下を貼り付け：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /students/{studentId} {
      allow read, write: if request.auth != null;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 5. ウェブアプリの追加と設定値の取得

1. プロジェクトの概要 → 歯車アイコン → 「プロジェクトの設定」
2. 下にスクロール → 「マイアプリ」→ `</>` アイコン（ウェブ）
3. アプリのニックネーム: 例 `student-manager-web`
4. 「アプリを登録」
5. 表示される `firebaseConfig` の値をコピー

---

## 6. firebase.config.ts の更新

`firebase.config.ts` を開いて、以下のように書き換えてください：

```typescript
export const firebaseConfig = {
  apiKey: "実際のAPIキー",
  authDomain: "実際のプロジェクトID.firebaseapp.com",
  projectId: "実際のプロジェクトID",
  storageBucket: "実際のプロジェクトID.appspot.com",
  messagingSenderId: "実際のメッセージ送信者ID",
  appId: "実際のアプリID",
};

// ここを true に変更
export const USE_FIREBASE = true;
```

---

## 7. ローカルテスト

```bash
npm run dev
```

ブラウザで http://localhost:5173 を開いてログイン確認。

---

## 8. Vercel へのデプロイ（本番公開）

1. https://vercel.com にアクセス（GitHub アカウントで登録）
2. 「New Project」→ このフォルダをアップロード or GitHub連携
3. 環境変数は不要（firebase.config.ts に直接記載）
4. 「Deploy」クリック
5. 自動でURLが発行される（例: `your-school.vercel.app`）

---

## よくある質問

**Q: 複数の学校で使いたい**
A: 各学校ごとに別の Firebase プロジェクトを作成するか、
   firebaseService.ts の `schoolId` パラメータを活用してください。

**Q: データのバックアップは？**
A: Firestore は自動バックアップあり。
   アプリ内の「バックアップ保存」ボタンでもJSONダウンロード可能。

**Q: USE_FIREBASE = false のままでも使える？**
A: はい。ローカルのみで使う場合は false のままで問題ありません。
   データはブラウザの localStorage に保存されます。
