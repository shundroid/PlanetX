# Planet
Planet v1.0 by shundroid

## Release log
- Browserify対応！js/modules/以下にモジュールがあるぞ！

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
  
## Gulp
Browserify、Watchifyに対応。

### 普通に実行する
```bash
gulp browserify --dev
```

`--dev`は、つけるとall.jsを圧縮しない。

### watchify
```bash
gulp w-browserify --dev
```

`--dev`は、普通に実行したときと同じ。