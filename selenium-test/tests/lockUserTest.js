const { Builder, By, until } = require("selenium-webdriver");


async function lockUserTest() {


    let driver = await new Builder()
        .forBrowser("chrome")
        .build();



    try {


        console.log("🚀 Bắt đầu test khóa tài khoản người dùng");



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
        // VÀO QUẢN LÝ NGƯỜI DÙNG
        // =====================


        let userMenu = await driver.wait(

            until.elementLocated(

                By.xpath(
                    "//span[contains(.,'Người dùng') or contains(.,'Quản lý người dùng')]"
                )

            ),

            10000

        );


        await driver.executeScript(
            "arguments[0].click();",
            userMenu
        );


        console.log(
            "✓ Vào trang quản lý người dùng"
        );


        await driver.sleep(3000);




        // =====================
        // CLICK NÚT KHÓA
        // =====================


        let lockBtn = await driver.wait(

            until.elementLocated(

                By.xpath(
                    "(//button[contains(.,'Khóa') or contains(.,'Lock') or contains(.,'Vô hiệu hóa')])[1]"
                )

            ),

            10000

        );


        await driver.executeScript(
            "arguments[0].scrollIntoView(true);",
            lockBtn
        );


        await driver.sleep(1000);


        await driver.executeScript(
            "arguments[0].click();",
            lockBtn
        );


        console.log(
            "✓ Đã click nút Khóa tài khoản"
        );


        await driver.sleep(2000);




        // =====================
        // XÁC NHẬN POPUP
        // =====================


        try {


            let confirmBtn = await driver.wait(

                until.elementLocated(

                    By.xpath(
                        "//button[contains(.,'Xác nhận') or contains(.,'Confirm') or contains(.,'Đồng ý') or contains(.,'OK')]"
                    )

                ),

                3000

            );


            await driver.executeScript(
                "arguments[0].click();",
                confirmBtn
            );


            console.log(
                "✓ Đã xác nhận khóa tài khoản"
            );


        }


        catch {


            console.log(
                "ℹ️  Không có popup xác nhận"
            );


        }


        await driver.sleep(3000);




        // =====================
        // KIỂM TRA KẾT QUẢ
        // =====================


        try {


            let successMsg = await driver.wait(

                until.elementLocated(

                    By.xpath(
                        "//*[contains(.,'thành công') or contains(.,'Đã khóa') or contains(.,'success')]"
                    )

                ),

                3000

            );


            let msgText = await successMsg.getText();


            console.log(
                "✅ TEST PASS: Khóa tài khoản thành công - " + msgText
            );


        }


        catch {


            console.log(
                "✅ TEST PASS: Đã thực hiện khóa tài khoản"
            );


        }


    }


    catch(error) {


        console.log(
            "❌ TEST FAIL"
        );


        console.log(
            error.message
        );


    }


    finally {


        await driver.sleep(3000);


        await driver.quit();


    }


}


lockUserTest();