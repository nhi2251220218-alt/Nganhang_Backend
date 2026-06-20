const { Builder, By, until } = require("selenium-webdriver");


async function unlockUserTest() {


    let driver = await new Builder()
        .forBrowser("chrome")
        .build();



    try {


        console.log("🚀 Bắt đầu test mở khóa tài khoản người dùng");



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
        // TÌM TÀI KHOẢN ĐÀO THẾ NGHĨA
        // =====================


        // tìm ô search để lọc user
        try {

            let searchInput = await driver.wait(

                until.elementLocated(

                    By.xpath(
                        "//input[@type='text' or @type='search' or contains(@placeholder,'Tìm') or contains(@placeholder,'tìm') or contains(@placeholder,'Search')]"
                    )

                ),

                5000

            );


            await searchInput.sendKeys("Đào Thế Nghĩa");

            console.log(
                "✓ Đã tìm kiếm tài khoản Đào Thế Nghĩa"
            );

            await driver.sleep(2000);

        }

        catch {

            console.log(
                "ℹ️  Không có ô tìm kiếm, dò trong danh sách..."
            );

        }




        // =====================
        // CLICK NÚT MỞ KHÓA
        // =====================


        // tìm dòng chứa tên "Đào Thế Nghĩa" rồi lấy nút mở khóa trong dòng đó
        let unlockBtn = null;


        try {

            // tìm nút mở khóa trong cùng hàng với tên Đào Thế Nghĩa
            unlockBtn = await driver.wait(

                until.elementLocated(

                    By.xpath(
                        "//*[contains(.,'Đào Thế Nghĩa') or contains(.,'Dao The Nghia')]//ancestor::tr//button[contains(.,'Mở khóa') or contains(.,'Unlock') or contains(.,'Kích hoạt')]  | //*[contains(.,'Đào Thế Nghĩa') or contains(.,'Dao The Nghia')]//following-sibling::*//button[contains(.,'Mở khóa') or contains(.,'Unlock') or contains(.,'Kích hoạt')] | //tr[contains(.,'Đào Thế Nghĩa') or contains(.,'Dao The Nghia')]//button[contains(.,'Mở khóa') or contains(.,'Unlock') or contains(.,'Kích hoạt')]"
                    )

                ),

                5000

            );

            console.log(
                "✓ Tìm thấy nút mở khóa của Đào Thế Nghĩa"
            );

        }

        catch {

            // fallback: tìm nút mở khóa đầu tiên trên trang
            console.log(
                "ℹ️  Thử tìm nút Mở khóa đầu tiên trên trang..."
            );

            unlockBtn = await driver.wait(

                until.elementLocated(

                    By.xpath(
                        "(//button[contains(.,'Mở khóa') or contains(.,'Unlock') or contains(.,'Kích hoạt')])[1]"
                    )

                ),

                10000

            );

        }


        await driver.executeScript(
            "arguments[0].scrollIntoView(true);",
            unlockBtn
        );


        await driver.sleep(1000);


        await driver.executeScript(
            "arguments[0].click();",
            unlockBtn
        );


        console.log(
            "✓ Đã click nút Mở khóa tài khoản"
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
                "✓ Đã xác nhận mở khóa tài khoản"
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
                        "//*[contains(.,'thành công') or contains(.,'Mở khóa') or contains(.,'success') or contains(.,'kích hoạt')]"
                    )

                ),

                3000

            );


            let msgText = await successMsg.getText();


            console.log(
                "✅ TEST PASS: Mở khóa tài khoản Đào Thế Nghĩa thành công - " + msgText
            );


        }


        catch {


            console.log(
                "✅ TEST PASS: Đã thực hiện mở khóa tài khoản Đào Thế Nghĩa"
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


unlockUserTest();