const { Builder, By, until } = require("selenium-webdriver");


async function exportStatementTest() {


    let driver = await new Builder()
        .forBrowser("chrome")
        .build();



    try {


        console.log("🚀 Bắt đầu test xuất sao kê");



        // =====================
        // LOGIN ADMIN
        // =====================


        await driver.get(
            "http://localhost:3000/login"
        );


        await driver.manage()
            .window()
            .maximize();


        await driver.sleep(3000);



        // nhập email

        await driver.wait(
            until.elementLocated(
                By.xpath("//input[@placeholder='example@email.com']")
            ),
            10000
        )
        .sendKeys(
            "admin@ynbanking.com"
        );


        console.log("✓ Nhập email");




        // nhập password

        await driver.wait(
            until.elementLocated(
                By.xpath("//input[@placeholder='••••••••••']")
            ),
            10000
        )
        .sendKeys(
            "Admin@123456"
        );


        console.log("✓ Nhập password");





        // chọn quyền admin

        await driver.wait(

            until.elementLocated(

                By.xpath(
                    "//button[contains(.,'Quản trị viên')]"
                )

            ),

            10000

        )
        .click();



        console.log("✓ Chọn quyền Admin");






        // login

        await driver.wait(

            until.elementLocated(

                By.xpath(
                    "//button[contains(.,'Đăng nhập')]"
                )

            ),

            10000

        )
        .click();



        console.log("✓ Đã bấm đăng nhập");





        // chờ dashboard

        await driver.wait(

            until.urlContains(
                "admin/dashboard"
            ),

            10000

        );


        console.log(
            "✓ Vào Admin Dashboard"
        );



        await driver.sleep(3000);




        // =====================
        // VÀO GIAO DỊCH
        // =====================


        let transactionMenu = await driver.wait(

            until.elementLocated(

                By.xpath(
                    "//span[contains(.,'Giao dịch')]"
                )

            ),

            10000

        );



        await driver.executeScript(
            "arguments[0].click();",
            transactionMenu
        );



        console.log(
            "✓ Vào trang giao dịch"
        );



        await driver.sleep(3000);






        // =====================
        // CLICK XUẤT SAO KÊ
        // =====================



        let exportBtn = await driver.wait(

            until.elementLocated(

                By.xpath(
                    "//button[contains(.,'Xuất sao kê')]"
                )

            ),

            10000

        );



        await driver.executeScript(

            "arguments[0].click();",

            exportBtn

        );



        console.log(
            "✓ Đã click Xuất sao kê"
        );



        await driver.sleep(5000);



        console.log(
            "✅ TEST PASS: Xuất sao kê thành công"
        );



    }



    catch(error){


        console.log(
            "❌ TEST FAIL"
        );


        console.log(
            error.message
        );


    }



    finally{


        await driver.sleep(3000);


        await driver.quit();


    }


}



exportStatementTest();