# Planet
Planet v1.0 by shundroid

Azure build branch  
[http://planet-maker.azurewebsites.net/](http://planet-maker.azurewebsites.net)  

## What's this?
HTML5でできた、2Dアクションゲーム用ステージ作成ツール。  
（今、Planetに対応したアクションゲームをUnityで作成中）  

### 次のような形式になる。
```
// ブロックの場合
<ブロック名>,<X座標>,<Y座標>=<名前>
// 属性の場合
*<属性名>,<パラメータ1>,<パラメータ2>,....
```
CSVチック。

## 準備
次のモジュールがない場合は、インストールしてください。  
- gulp
  
次のコマンドを入力してください。  
```bash
npm i
bower i
```
  
## ブラウザについて
次の構文などが対応しているブラウザに対応しています。  
Firefox 45.0で確認しています。
- `Array.prototype.forEach()`
- `DOMContentLoaded` Event
- `try-catch` 文
- CSS flexible box
- `Object.defineProperty()`
- Promise
- CSS PointerEvents
  
## 開発について
| 種類 | 言語 |
|:--|:--|
| スクリプト言語 | Typescript |
| スタイルシート言語 | Less |
| マークアップ言語 | Jade |

- Gulpでコンパイル
- パッケージ管理はNode Package Manager、Bower
- TypescriptはCommonjsモジュール、Browserifyを使用。

### GulpでのBrowserify

#### 普通に実行する
```bash
gulp brify
```

#### Taskのオプション
- `--min`は、つけると uglify をし、all.min.js として出す。
- `--watch`は、つけると watchify する。

### ブラウザでの確認
サーバーサイドスクリプトは使用してないが、Ajaxを使用している。  
ローカルでのAjaxに対応していないブラウザでは、XAMPP、Apacheなどでサーバーを立てる。