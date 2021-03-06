import {Builder, Capabilities, Key, By} from 'selenium-webdriver';
import { expect } from 'chai';
import { driver } from 'mocha-webdriver';

const mainPath = 'file:///C:/cygwin64/home/dwite/Dokumenty/WWW/laby/strona.html'
const lotPath = 'file:///C:/cygwin64/home/dwite/Dokumenty/WWW/laby/lot.html'




const jutroData = new Date();
jutroData.setDate((new Date()).getDate() + 1);
const JUTRO = jutroData.toISOString().slice(0, 10);


async function wypelnij_pola(imie : string, nazwisko : string, data : string) {
    await (await driver.find('#fname')).clear();
    await driver.find('#fname').sendKeys(imie);
    await driver.find('#lname').sendKeys(nazwisko);
    await driver.find('input[type=date]').sendKeys(data);
}

describe('test1', () => {
    it('za wczesna/dobra data', async function() {
        this.timeout(20000);
        await driver.get(mainPath);

        await wypelnij_pola("Pan", "Nowak", "2020-04-15");

        await driver.find('#sbm').doClick();
        expect(await driver.find('.message').getText()).to.equal('');
    });
    it('późna data powinna kończyć się powodzeniem', async function() {
        this.timeout(20000);
        await driver.get(mainPath);

        await wypelnij_pola("Pan", "Nowak", JUTRO);

        await driver.find('#sbm').doClick();
        expect(await driver.find('.message').getText()).to.include('Formularz wysłany');
    });
})

describe('test2', () => {
    it('kliknięcie w przycisk na poczatku powinno być błędem', async function() {
        this.timeout(20000);
        await driver.get(mainPath);
        await driver.find('#sbm').doClick();
        expect(await driver.find('.message').getText()).to.equal('');
    });
})

describe('test pustych pol formularza', () => {
    // uzucie .clear nie jest za fajne, bo aktywowany jest event onChange
    // zamiast eventu onInput. Ale jeśli się wie co się robi to można korzystać
    it('imie jest puste - przycisk nieaktywny', async function() {
        this.timeout(20000);
        await driver.get(mainPath);

        await wypelnij_pola("", "Nowak", JUTRO);

        await driver.find('#sbm').doClick();
        expect(await driver.find('.message').getText()).to.equal('');
    });
    it('nazwisko jest puste - przycisk nieaktywny', async function() {
        this.timeout(20000);
        await driver.get(mainPath);

        await wypelnij_pola("", "", JUTRO);

        await driver.find('#sbm').doClick();
        expect(await driver.find('.message').getText()).to.equal('');
    });
    it('data jest pusta - przycisk nieaktywny', async function() {
        this.timeout(20000);
        await driver.get(mainPath);

        await wypelnij_pola("Jan", "Nowak", "");

        await driver.find('#sbm').doClick();
        expect(await driver.find('.message').getText()).to.equal('');
    });
})

describe('test wypelnienia pol a potem usuniecia tekstu', () => {
    it('przycisk powinien byc zablokowany', async function() {
        this.timeout(20000);
        await driver.get(mainPath);

        await wypelnij_pola("Janusz", "W", JUTRO);

        await (await driver.find('#lname')).sendKeys(Key.BACK_SPACE);

        await driver.find('#sbm').doClick();
        expect(await driver.find('.message').getText()).to.equal('');
    });
})

describe('popup zawiera wlasciwe dane', () => {
    it('powinien zawierac imie, nazwisko i datę', async function() {
        this.timeout(20000);
        await driver.get(mainPath);

        await wypelnij_pola("Marek", "Kowalski", JUTRO);

        await driver.find('#sbm').doClick();
        expect(await driver.find('.message').getText()).to.include('Marek');
        expect(await driver.find('.message').getText()).to.include('Kowalski');
        expect(await driver.find('.message').getText()).to.include(JUTRO);
    });
})

describe('linków na stronie nie da się kliknąć po wysłaniu formularza', () => {
    it('powinno nic nie dziac sie po kliknieciu na nie', async function() {
        this.timeout(20000);
        await driver.get(mainPath);

        await wypelnij_pola("Marek", "Kowalski", JUTRO);

        await driver.find('#sbm').doClick();
        let czyBladWystapil = false;
        try {
            await driver.findElement(By.partialLinkText("WAW")).click();
        } catch (err) {
            czyBladWystapil = true;
        }
        expect(czyBladWystapil);
    });
})

describe('linki są klikalne', () => {
    it('tak po prostu muszą być klikalne', async function() {
        this.timeout(20000);
        await driver.get(mainPath);
        await driver.findElement(By.partialLinkText("WAW")).click();
        expect(await driver.getCurrentUrl()).to.equal(lotPath);
    });

    it('po zamknieciu popupu są klikalne', async function() {
        this.timeout(20000);
        await driver.get(mainPath);

        await wypelnij_pola("Marek", "Kowalski", JUTRO);

        await driver.find('#sbm').doClick();
        await driver.findElement(By.partialLinkText("zamknij")).click();
        await driver.findElement(By.partialLinkText("WAW")).click();
        expect(await driver.getCurrentUrl()).to.equal(lotPath);
    });
})
