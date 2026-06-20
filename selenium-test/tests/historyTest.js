const { Builder, By, until } = require('selenium-webdriver');


async function historyTest() {


    let driver = await new Builder()
        .forBrowser('chrome')
        .build();



    try {


        console.log("🚀 Bắt đầu kiểm thử lịch sử giao dịch");



        // Mở trang login

        await driver.get(
            "http://localhost:3000/login"
        );


        await driver.manage()
            .window()
            .maximize();


        await driver.sleep(3000);




        // =========================
        // Nhập email user
        // =========================


        let emailInput = await driver.wait(

            until.elementLocated(

                By.xpath(
                    "//input[@placeholder='example@email.com']"
                )

            ),

            10000

        );


        await emailInput.sendKeys(
            "minhtan@gmail.com"
        );


        console.log(
            "✓ Nhập email thành công"
        );





        // =========================
        // Nhập password
        // =========================


        let passwordInput = await driver.wait(

            until.elementLocated(

                By.xpath(
                    "//input[@placeholder='••••••••••']"
                )

            ),

            10000

        );


        await passwordInput.sendKeys(
            "123"
        );


        console.log(
            "✓ Nhập mật khẩu thành công"
        );





        // =========================
        // Click đăng nhập
        // =========================


        await driver.findElement(

            By.xpath(
                "//button[contains(.,'Đăng nhập')]"
            )

        )
        .click();



        console.log(
            "✓ Đã đăng nhập"
        );





        // Chờ dashboard

        await driver.wait(

            until.urlContains(
                "/dashboard"
            ),

            10000

        );



        console.log(
            "✓ Vào Dashboard thành công"
        );





        // =========================
        // Truy cập lịch sử giao dịch
        // =========================


        await driver.get(

            "http://localhost:3000/history"

        );



        await driver.sleep(5000);





        let currentUrl =
            await driver.getCurrentUrl();




        if(currentUrl.includes("history")){


            console.log(
                "✅ TEST PASS: Truy cập lịch sử giao dịch thành công"
            );


        }

        else{


            console.log(
                "❌ Không vào được trang lịch sử giao dịch"
            );


        }



    }


    catch(error){


        console.log(
            "❌ Kiểm thử thất bại"
        );


        console.log(
            error.message
        );


    }



    finally{


        await driver.sleep(3000);

        await driver.quit();


        console.log(
            "🏁 Kết thúc kiểm thử"
        );


    }


}



historyTest();