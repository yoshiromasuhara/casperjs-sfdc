"use strict";

//インスタンス生成
var casper = require("casper").create({
    viewportSize:{
        "width": 1280,
        "height": 800
    }
});

//ユーザ名およびパスワードをパラメータから取得
var usernm=(casper.cli.has('usernm'))?casper.cli.get('usernm'):"";
var passwd=(casper.cli.has('passwd'))?casper.cli.get('passwd'):"";

//ユーザ/パスが未設定
if(usernm=="" || passwd==""){
    casper.die("Username Or Password is not input!!",1);
}

//初回用の確認コードをパラメータから取得
var checkcode = (casper.cli.has('checkcode'))?casper.cli.get('checkcode'):"";

//ログイン処理
casper.start("https://login.salesforce.com/", function() {
    this.fill("form", {
        "username":usernm,
        "pw":passwd
    }, true);
});

//確認コード要求
casper.then(function(){
    //確認コードを入力
    this.waitForSelector("#content .verifyform",function(){

        //確認コード登録フォーム
        if (this.exists("#content .verifyform #save") && this.exists("#content .verifyform #code")) {
            this.echo("input checkcode!");
            this.fill("form#editPage",{
                "code":checkcode
            },false);

            return this.click("#content .verifyform #save");

        //確認コード送信画面
        }else if(this.exists("#content .verifyform #save")) {
            this.echo("displaied send checkcode!");
            return this.click("#content .verifyform #save");
        }
    },function(){
        return;
    },3000);
});

//携帯電話番号の登録ページ
casper.then(function(){
    this.waitForSelector("#content .verifyoptions a",function(){
        this.echo("throw Mynumber!");
        //後で通知してください。ログインするをクリック
        return this.click("#content .verifyoptions a");
    },function(){
        return;
    },3000);
});

//ダッシュボードページに遷移
casper.then(function() {
    this.waitForSelector("li#Dashboard_Tab",function(){
        //ダッシュボードタブを選択
        this.echo("select dashboard!");
        return this.click("li#Dashboard_Tab a");

    },function(){
        this.echo("Timeout select dashboard!");
    },10000);
});

//ダッシュボードページで更新ボタンをクリック
casper.then(function() {
    this.waitForSelector(".dashboardViewPageHeader #refreshMenu",function(){
        //更新前のページをキャプチャ
        this.captureSelector("dashboard_before_refresh.png",".dashboardHeader");

        //更新ボタンをクリック
        this.click("#refreshMenu a.firstMenuItem");

        //更新中ラベルチェック（ダッシュボードの更新は時間がかかる場合があるのでタイムアウトを30秒にセット）
        this.waitForSelectorTextChange("#refreshLabel",function(){
            //更新後のページをキャプチャ
            this.captureSelector("dashboard_after_refresh.png",".dashboardHeader");
        },function(){
            this.echo("Timeout click refresh!");
        },30000);

    },function(){
        this.echo("Timeout refresh dashboard!");
    },10000);
});

//実行
casper.run();
