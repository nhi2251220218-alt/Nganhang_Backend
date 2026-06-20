const { Builder, By, until } = require('selenium-webdriver');

async function logoutTest() {

    let driver = await new Builder()
        .forBrowser('chrome')
        .build();

    try {

        console.log("🚀 Bắt đầu test đăng xuất");

        // Mở trang đăng nhập
        await driver.get("http://localhost:3000/login");

        await driver.manage()
            .window()
            .maximize();

        await driver.sleep(2000);


        // nhập email
        await driver.wait(
            until.elementLocated(
                By.xpath("//input[@placeholder='example@email.com']")
            ),
            10000
        )
        .sendKeys("yennhi@gmail.com");

        console.log("✓ Nhập email");


        // nhập password
        await driver.wait(
            until.elementLocated(
                By.xpath("//input[@placeholder='••••••••••']")
            ),
            10000
        )
        .sendKeys("123");

        console.log("✓ Nhập password");


        // click đăng nhập
        await driver.wait(
            until.elementLocated(
                By.xpath("//button[contains(.,'Đăng nhập')]")
            ),
            10000
        )
        .click();

        console.log("✓ Đã bấm đăng nhập");


        // chờ vào dashboard
        await driver.wait(
            until.urlContains("dashboard"),
            10000
        );

        console.log("✓ Vào Dashboard thành công");

        await driver.sleep(3000);


        // =====================
        // ĐĂNG XUẤT
        // =====================


        let logoutBtn = await driver.wait(

            until.elementLocated(

                By.xpath(
                    "//button[contains(.,'Đăng xuất')]"
                )

            ),

            10000

        );


        await driver.executeScript(
            "arguments[0].click();",
            logoutBtn
        );


        console.log("✓ Đã bấm đăng xuất");


        // chờ về trang login
        await driver.wait(
            until.urlContains("login"),
            10000
        );


        console.log("✅ TEST PASS: Đăng xuất thành công");

    }

    catch(error) {

        console.log("❌ TEST FAIL: Đăng xuất thất bại");

        console.log(error.message);

    }

    finally {

        await driver.sleep(3000);

        await driver.quit();

    }

}

logoutTest();