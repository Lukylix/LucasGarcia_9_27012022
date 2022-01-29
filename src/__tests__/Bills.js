/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES_PATH } from "../constants/routes";
import Router from "../app/Router.js";
import Bills from "../containers/Bills.js";

describe("Given I am connected as an employee", () => {
	describe("When I am on Bills Page", () => {
		test("Then bill icon in vertical layout should be highlighted", () => {
			Object.defineProperty(window, "localStorage", { value: localStorageMock });
			const user = JSON.stringify({
				type: "Employee",
			});
			window.localStorage.setItem("user", user);
			document.body.innerHTML = `<div id="root"></div>`;
			window.location.assign(ROUTES_PATH["Bills"]);
			Router();
			const billIcon = screen.getByTestId("icon-window");
			expect(billIcon.className).toContain("active-icon");
		});
		test("Then bills should be ordered from earliest to latest", () => {
			const html = BillsUI({ data: bills });
			document.body.innerHTML = html;
			const dates = screen
				.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
				.map((a) => a.innerHTML);
			const antiChrono = (a, b) => (a < b ? 1 : -1);
			const datesSorted = [...dates].sort(antiChrono);
			expect(dates).toEqual(datesSorted);
		});
		test("Then eye icons should be displayed", () => {
			const html = BillsUI({ data: bills });
			document.body.innerHTML = html;
			const eyeIcons = screen.getAllByTestId("icon-eye");
			expect(eyeIcons.length).toBe(bills.length);
		});
		describe("When click on create new bill", () => {
			test("Then user should be redirect to the new bill page", () => {
				const html = BillsUI({ data: bills });
				document.body.innerHTML = html;
				const onNavigate = jest.fn();
				Object.defineProperty(window, "localStorage", { value: localStorageMock });
				const user = JSON.stringify({
					type: "Employee",
				});
				window.localStorage.setItem("user", user);
				new Bills({ document, onNavigate, store: null, localStorage: window.localStorage });

				const newBill = screen.getByTestId("btn-new-bill");
				newBill.click();
				expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["NewBill"]);
			});
		});
		describe("When click on eye icon", () => {
			test("Then bill modal should be displayed", () => {
				const html = BillsUI({ data: bills });
				document.body.innerHTML = html;
				const onNavigate = () => {};
				Object.defineProperty(window, "localStorage", { value: localStorageMock });
				const user = JSON.stringify({
					type: "Employee",
				});
				window.localStorage.setItem("user", user);
				new Bills({ document, onNavigate, store: null, localStorage: window.localStorage });
				const eyeIcons = screen.getAllByTestId("icon-eye");
				eyeIcons[0].click();
				const imgUrl = eyeIcons[0].getAttribute("data-bill-url");
				const modal = screen.getByTestId("modaleFile");
				const modalImg = modal.querySelector(".modal-body img");

				expect(modal.innerHTML).toContain("Justificatif");
				expect(modalImg.src).toContain(encodeURI(imgUrl));
			});
		});
	});
});
