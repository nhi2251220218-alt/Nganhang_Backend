const { Builder, By, until } = require('selenium-webdriver');

async function loginTest() {

    let driver = await new Builder()
        .forBrowser('chrome')
        .build();

    try {

        // Mở trang đăng nhập
        await driver.get('http://localhost:3000/login');

        // Phóng to cửa sổ
        await driver.manage().window().maximize();

        // Chờ trang load
        await driver.sleep(2000);

        // Nhập email
        await driver.wait(
            until.elementLocated(
                By.xpath("//input[@placeholder='example@email.com']")
            ),
            10000
        )
        .sendKeys("yennhi@gmail.com");

        console.log("✓ Nhập email");

        // Nhập mật khẩu
        await driver.wait(
            until.elementLocated(
                By.xpath("//input[@placeholder='••••••••••']")
            ),
            10000
        )
        .sendKeys("123");

        console.log("✓ Nhập password");

        // Click nút đăng nhập
        await driver.wait(
            until.elementLocated(
                By.xpath("//button[contains(.,'Đăng nhập')]")
            ),
            10000
        )
        .click();

        console.log("✓ Đã bấm đăng nhập");

        // Chờ chuyển trang dashboard
        await driver.wait(
            until.urlContains("dashboard"),
            10000
        );

        console.log("✅ TEST PASS: Đăng nhập thành công");

    }

    catch (error) {

        console.log("❌ TEST FAIL: Đăng nhập thất bại");

        console.log(error.message);

    }

    finally {

        await driver.sleep(3000);

        await driver.quit();

    }

}

loginTest();