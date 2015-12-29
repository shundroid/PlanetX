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
  
## APIなどについて

使用するもの
- Array.prototype.forEach
- DOMContentLoaded Event
- try-catch 文
- display: flex;
  
## tsのルール
- main.ts, planet.ts, ui.tsの3つをPlaSourcesという。
- document.addEventListener, document.getElementById はui.ts以外のPlaSourcesには書かない。
- lib/ 以下のファイルから、PlaSourcesは参照しない。

## MVCについて
- model: planet.ts
- view: ui.ts
- controller: main.ts

  ルール
- UIイベントはui.tsへ直接送られ、そこからmain.tsへ行くようにする。