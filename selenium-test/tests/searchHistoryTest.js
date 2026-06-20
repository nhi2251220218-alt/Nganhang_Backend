const { Builder, By, until } = require('selenium-webdriver');

async function searchHistoryTest() {

    let driver = await new Builder()
        .forBrowser('chrome')
        .build();

    try {

        console.log("🚀 Bắt đầu test tìm kiếm lịch sử giao dịch theo ngày");

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
        // VÀO LỊCH SỬ GIAO DỊCH
        // =====================


        await driver.get(
            "http://localhost:3000/history"
        );


        await driver.wait(
            until.urlContains("history"),
            10000
        );


        console.log("✓ Vào trang lịch sử giao dịch");

        await driver.sleep(3000);


        // =====================
        // CHỌN NGÀY BẮT ĐẦU
        // =====================


        let dateInputs = await driver.findElements(
            By.xpath("//input[@type='date']")
        );


        // dùng nativeInputValueSetter để React nhận state
        await driver.executeScript(`

            let input = arguments[0];
            let nativeSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype,
                'value'
            ).set;

            nativeSetter.call(input, '2026-06-16');

            input.dispatchEvent(new Event('input',  { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));

        `, dateInputs[0]);


        console.log("✓ Đã chọn ngày bắt đầu 16/06/2026");

        await driver.sleep(1000);


        // =====================
        // CHỌN NGÀY KẾT THÚC
        // =====================


        await driver.executeScript(`

            let input = arguments[0];
            let nativeSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype,
                'value'
            ).set;

            nativeSetter.call(input, '2026-06-16');

            input.dispatchEvent(new Event('input',  { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));

        `, dateInputs[1]);


        console.log("✓ Đã chọn ngày kết thúc 16/06/2026");

        await driver.sleep(1000);


        // =====================
        // CLICK NÚT KÍNH LÚP
        // =====================


        let allButtons = await driver.findElements(
            By.xpath("//button")
        );


        let searchBtn = null;


        for (let btn of allButtons) {

            let btnText = await btn.getText();

            if (btnText.trim() === '') {

                searchBtn = btn;

                break;

            }

        }


        if (searchBtn) {

            await driver.executeScript(
                "arguments[0].click();",
                searchBtn
            );

            console.log("✓ Đã click nút kính lúp tìm kiếm");

        }


        // chờ API fetch xong
        await driver.sleep(5000);


        // =====================
        // KIỂM TRA KẾT QUẢ
        // =====================


        let bodyText = await driver.findElement(
            By.xpath("//body")
        )
        .getText();


        if (
            bodyText.includes("Giao dịch chuyển tiền") ||
            bodyText.includes("Giao dịch nhận tiền")
        ) {

            let txCount = (
                bodyText.match(/Thời gian:/g) || []
            ).length;

            console.log(
                "✅ TEST PASS: Tìm thấy " + txCount + " giao dịch ngày 16/06/2026"
            );

        }

        else if (bodyText.includes("Không có giao dịch")) {

            console.log(
                "❌ TEST FAIL: Không hiển thị giao dịch dù ngày 16/06/2026 có data"
            );

        }

        else {

            console.log("⚠️  Nội dung trang (500 ký tự đầu):");

            console.log(bodyText.slice(0, 500));

        }

    }

    catch(error) {

        console.log("❌ TEST FAIL: Lọc theo ngày thất bại");

        console.log(error.message);

    }

    finally {

        await driver.sleep(3000);

        await driver.quit();

    }

}

searchHistoryTest();