const { Builder, By, until } = require("selenium-webdriver");


async function loginTest() {

    let driver = await new Builder()
        .forBrowser("chrome")
        .build();


    try {


        await driver.get(
            "http://localhost:3000/login"
        );


        await driver.manage()
            .window()
            .maximize();


        await driver.sleep(3000);



        // Email
        await driver.wait(
            until.elementLocated(
                By.xpath("//input[@placeholder='example@email.com']")
            ),
            10000
        )
        .sendKeys("admin@ynbanking.com");


        console.log("Nhap email thanh cong");



        // Password
        await driver.wait(
            until.elementLocated(
                By.xpath("//input[@placeholder='••••••••••']")
            ),
            10000
        )
        .sendKeys("Admin@123456");


        console.log("Nhap password thanh cong");



        // Chọn quyền Admin
        await driver.findElement(

            By.xpath(
                "//button[contains(.,'Quản trị viên')]"
            )

        )
        .click();


        console.log("Chon Admin thanh cong");



        // Click đăng nhập

        await driver.findElement(

            By.xpath(
                "//button[contains(.,'Đăng nhập')]"
            )

        )
        .click();



        console.log("Da bam dang nhap");


        await driver.sleep(5000);



        console.log(
            "URL:",
            await driver.getCurrentUrl()
        );



    }


    catch(error){


        console.log(
            "TEST LOI:"
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


loginTest();