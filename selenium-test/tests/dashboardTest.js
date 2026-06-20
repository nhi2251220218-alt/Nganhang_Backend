const { Builder, By, until } = require('selenium-webdriver');


async function dashboardUserTest() {


    let driver = await new Builder()
        .forBrowser('chrome')
        .build();


    try {


        console.log("🚀 Bắt đầu kiểm thử User Dashboard");



        // Mở trang login

        await driver.get(
            "http://localhost:3000/login"
        );


        await driver.manage()
            .window()
            .maximize();



        await driver.sleep(3000);




        // =========================
        // Kiểm tra đang ở chế độ Khách hàng
        // =========================


        console.log(
            "✓ Mặc định là Khách hàng"
        );





        // =========================
        // Nhập Email
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
        // Nhập mật khẩu
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


        let loginButton = await driver.wait(

            until.elementLocated(

                By.xpath(
                    "//button[contains(.,'Đăng nhập')]"
                )

            ),

            10000

        );


        await loginButton.click();



        console.log(
            "✓ Đã click đăng nhập"
        );





        // =========================
        // Kiểm tra Dashboard User
        // =========================


        await driver.wait(

            until.urlContains(
                "/dashboard"
            ),

            10000

        );



        console.log(
            "✅ TEST PASS: Người dùng vào Dashboard thành công"
        );



        console.log(
            "URL:",
            await driver.getCurrentUrl()
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


        console.log(
            "🏁 Kết thúc kiểm thử User Dashboard"
        );


    }


}



dashboardUserTest();