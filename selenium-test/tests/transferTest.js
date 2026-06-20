const { Builder, By, until } = require('selenium-webdriver');

async function transferTest() {

    let driver = await new Builder()
        .forBrowser('chrome')
        .build();

    try {

        console.log("🚀 Bắt đầu test chuyển tiền");


        // Mở trang đăng nhập
        await driver.get('http://localhost:3000/login');

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
        // VÀO TRANG CHUYỂN TIỀN
        // =====================


        await driver.get(
            "http://localhost:3000/transfer"
        );


        await driver.wait(
            until.urlContains("transfer"),
            10000
        );


        console.log("✓ Vào trang chuyển tiền");

        await driver.sleep(3000);


        // =====================
        // NHẬP SỐ TÀI KHOẢN NHẬN
        // =====================


        let accountInput = await driver.wait(

            until.elementLocated(

                By.xpath(
                    "//input[@placeholder='Nhập số tài khoản...']"
                )

            ),

            10000

        );


        await driver.executeScript(
            "arguments[0].scrollIntoView(true);",
            accountInput
        );


        await accountInput.sendKeys("0031082004");

        console.log("✓ Đã nhập số tài khoản nhận");


        await accountInput.sendKeys(
            require('selenium-webdriver').Key.TAB
        );

        console.log("✓ Đã nhấn Tab để tra cứu tài khoản");

        await driver.sleep(4000);


        // =====================
        // NHẬP SỐ TIỀN
        // =====================


        let amountInput = await driver.wait(

            until.elementLocated(

                By.xpath(
                    "//input[@type='number' and @placeholder='0']"
                )

            ),

            10000

        );


        await driver.executeScript(
            "arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });",
            amountInput
        );

        await driver.sleep(1000);


        await driver.executeScript(

            `
            let nativeSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype,
                'value'
            ).set;

            nativeSetter.call(arguments[0], '100000');

            arguments[0].dispatchEvent(new Event('input',  { bubbles: true }));
            arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
            `,

            amountInput

        );

        console.log("✓ Đã nhập số tiền 100,000 ₫");

        await driver.sleep(1000);


        // =====================
        // NHẬP NỘI DUNG
        // =====================


        let noteInput = await driver.wait(

            until.elementLocated(

                By.xpath(
                    "//input[@placeholder='Ví dụ: Thanh toán hóa đơn tháng 6...']"
                )

            ),

            10000

        );


        await driver.executeScript(
            "arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });",
            noteInput
        );

        await driver.sleep(500);

        await noteInput.sendKeys("Chuyen tien test");

        console.log("✓ Đã nhập nội dung chuyển tiền");

        await driver.sleep(1000);


        // =====================
        // NHẬP MẬT KHẨU CHUYỂN TIỀN
        // =====================


        let transferPasswordInput = await driver.wait(

            until.elementLocated(

                By.xpath(
                    "//input[@placeholder='Nhập mật khẩu xác thực']"
                )

            ),

            10000

        );


        await driver.executeScript(
            "arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });",
            transferPasswordInput
        );

        await driver.sleep(500);

        await transferPasswordInput.sendKeys("2908");

        console.log("✓ Đã nhập mật khẩu chuyển tiền");

        await driver.sleep(1000);


        // =====================
        // DEBUG: IN TẤT CẢ BUTTON
        // =====================


        let allButtons = await driver.findElements(
            By.xpath("//button")
        );

        console.log("ℹ️  Số button trên trang: " + allButtons.length);

        for (let i = 0; i < allButtons.length; i++) {

            let btnText = await allButtons[i].getText();

            let btnType = await allButtons[i].getAttribute("type");

            let btnClass = await allButtons[i].getAttribute("class");

            console.log(
                "   button[" + i + "] type=" + btnType +
                " text='" + btnText.trim() +
                "' class=" + btnClass
            );

        }


        // =====================
        // CLICK NÚT SUBMIT FORM
        // =====================


        // thử tìm button type=submit trước
        let submitBtn = null;


        try {

            submitBtn = await driver.findElement(

                By.xpath(
                    "//button[@type='submit']"
                )

            );

            console.log("✓ Tìm thấy button type=submit");

        } catch {}


        // thử tìm button chứa các text phổ biến
        if (!submitBtn) {

            try {

                submitBtn = await driver.findElement(

                    By.xpath(
                        "//button[contains(.,'Chuyển') or contains(.,'Gửi') or contains(.,'Xác nhận') or contains(.,'Tiếp theo') or contains(.,'Submit') or contains(.,'Thanh toán')]"
                    )

                );

                console.log("✓ Tìm thấy button theo text");

            } catch {}

        }


        // thử lấy button cuối cùng trên trang
        if (!submitBtn && allButtons.length > 0) {

            submitBtn = allButtons[allButtons.length - 1];

            console.log("✓ Dùng button cuối cùng trên trang");

        }


        if (submitBtn) {

            await driver.executeScript(
                "arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });",
                submitBtn
            );

            await driver.sleep(500);

            await driver.executeScript(
                "arguments[0].click();",
                submitBtn
            );

            console.log("✓ Đã click nút submit");

        }

        else {

            throw new Error("Không tìm thấy nút submit");

        }

        await driver.sleep(3000);


        // =====================
        // CLICK NÚT XÁC NHẬN (nếu có popup)
        // =====================


        try {

            let confirmBtn = await driver.wait(

                until.elementLocated(

                    By.xpath(
                        "//button[contains(.,'Xác nhận') or contains(.,'Confirm') or contains(.,'Đồng ý')]"
                    )

                ),

                3000

            );


            await driver.executeScript(
                "arguments[0].click();",
                confirmBtn
            );

            console.log("✓ Đã click nút xác nhận");

            await driver.sleep(5000);

        }

        catch {

            console.log("ℹ️  Không có popup xác nhận");

        }


        // =====================
        // KIỂM TRA KẾT QUẢ
        // =====================


        let bodyText = await driver.findElement(
            By.xpath("//body")
        )
        .getText();


        if (
            bodyText.includes("thành công") ||
            bodyText.includes("success") ||
            bodyText.includes("Chuyển tiền thành công")
        ) {

            console.log(
                "✅ TEST PASS: Chuyển tiền thành công"
            );

        }

        else {

            console.log(
                "❌ TEST FAIL: Không thấy thông báo thành công"
            );

            console.log(
                "⚠️  Nội dung trang (500 ký tự đầu):"
            );

            console.log(
                bodyText.slice(0, 500)
            );

        }

    }

    catch(error) {

        console.log("❌ TEST FAIL: Chuyển tiền thất bại");

        console.log(error.message);

    }

    finally {

        await driver.sleep(3000);

        await driver.quit();

    }

}

transferTest();