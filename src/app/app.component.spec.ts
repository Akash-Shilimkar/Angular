import {
  DebugElement,
  Predicate
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import {
  BrowserModule,
  By
} from '@angular/platform-browser';
import { faker } from '@faker-js/faker';
import {
  Cryptocurrency,
  cryptocurrencyList
} from '../shared/mock-api-response/cryptocurrency-list';
import { profileDetails } from '../shared/mock-api-response/profile-details';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;

  const get$ = {
    requestExchange: {
      get element(): DebugElement {
        const predicate: Predicate<DebugElement> = By.css('section[role="search"]');

        return fixture.debugElement.query(predicate);
      },
      exchangeAmount: {
        get element(): DebugElement {
          const predicate: Predicate<DebugElement> = By.css('input[type="number"]');

          return get$.requestExchange.element.query(predicate);
        },
        errors: {
          get element(): DebugElement {
            const predicate: Predicate<DebugElement> = By.css('label:has(input[type="number"]) + ul.errors');

            return get$.requestExchange.element.query(predicate);
          },
          get messages(): string[] | undefined {
            const predicate: Predicate<DebugElement> = By.css('li');

            return get$.requestExchange.exchangeAmount.errors.element?.queryAll(predicate).map<string>((message: DebugElement): string => {
              return message.nativeElement.textContent.trim();
            });
          }
        }
      },
      availableFiatBalanceAmount: {
        get value(): string {
          const predicate: Predicate<DebugElement> = By.css('label span');

          return get$.requestExchange.element.query(predicate).nativeElement.textContent.trim();
        }
      }
    },
    cryptocurrencyList: {
      get element(): DebugElement {
        const predicate: Predicate<DebugElement> = By.css('section[role="main"] table');

        return fixture.debugElement.query(predicate);
      },
      rows: {
        get columns(): string[][] {
          return get$.cryptocurrencyList.element.queryAll(By.css('tbody > tr')).map<string[]>((row: DebugElement): string[] => {
            return row.queryAll(By.css('td')).map<string>((column: DebugElement): string => {
              return column.nativeElement.textContent.trim();
            });
          });
        }
      }
    }
  };

  const set$ = {
    requestExchange: {
      exchangeAmount: {
        element: {
          set value(value: string) {
            const nativeElement: HTMLInputElement = get$.requestExchange.exchangeAmount.element.nativeElement;
            const event: Event = new Event('input');

            {
              nativeElement.value = value;
              nativeElement.dispatchEvent(event);
            }

            fixture.detectChanges();
          }
        }
      }
    }
  };

  const make$ = {
    amountToBeExchanged: {
      valid: {
        min: {
          get value(): string {
            const reference: number = .01;

            return help$.number.format.toFixed(reference);
          }
        },
        max: {
          get value(): string {
            const reference: number = profileDetails.availableFiatBalanceAmount;

            return help$.number.format.toFixed(reference);
          }
        },
        any: {
          get value(): string {
            const reference: number = faker.datatype.number({
              min: help$.number.set(make$.amountToBeExchanged.valid.min.value),
              max: help$.number.set(make$.amountToBeExchanged.valid.max.value),
              precision: .01
            });

            return help$.number.format.toFixed(reference);
          }
        }
      },
      invalid: {
        min: {
          boundary: {
            get value(): string {
              const reference: number = help$.number.get.step.before(make$.amountToBeExchanged.valid.min.value);

              return help$.number.format.toFixed(reference);
            }
          },
          any: {
            get value(): string {
              const reference: number = faker.datatype.float({
                min: -12345678.90,
                max: help$.number.set(make$.amountToBeExchanged.valid.min.value),
                precision: .01
              });

              return help$.number.format.toFixed(reference);
            }
          }
        },
        max: {
          boundary: {
            get value(): string {
              const reference: number = help$.number.get.step.after(make$.amountToBeExchanged.valid.max.value);

              return help$.number.format.toFixed(reference);
            }
          },
          any: {
            get value(): string {
              const reference: number = faker.datatype.number({
                min: help$.number.set(make$.amountToBeExchanged.valid.max.value),
                max: 12345678.90,
                precision: .01
              });

              return help$.number.format.toFixed(reference);
            }
          }
        },
        any: {
          get value(): string {
            const reference: number = faker.helpers.arrayElement([
              help$.number.set(make$.amountToBeExchanged.invalid.min.any.value),
              help$.number.set(make$.amountToBeExchanged.invalid.max.any.value)
            ]);

            return help$.number.format.toFixed(reference);
          }
        }
      }
    }
  };

  const help$ = {
    number: {
      get: {
        step: {
          before(value: any): number {
            const reference: number = help$.number.set(value);

            return reference - .01;
          },
          after(value: any): number {
            const reference: number = help$.number.set(value);

            return reference + .01;
          }
        }
      },
      set(value: any): number {
        return Number(value);
      },
      format: {
        toFixed(value: number, fractionDigits: number = 2): string {
          return value.toFixed(fractionDigits);
        },
        toString(value: number): string {
          return value.toString();
        }
      }
    },
    cryptocurrencyList: {
      calculate(exchangeRequestAmount: string): string[][] {
        return cryptocurrencyList.map<string[]>((currency: Cryptocurrency): string[] => {
          const exchangeRequestAmountNumber: number = help$.number.set(exchangeRequestAmount);

          let numberOfCoins: string = help$.number.format.toFixed(exchangeRequestAmountNumber * currency.rate, 8);

          if (exchangeRequestAmountNumber < .01 || exchangeRequestAmountNumber > profileDetails.availableFiatBalanceAmount) {
            numberOfCoins = 'n/a';
          }

          return [
            currency.name,
            `1 USD = ${currency.rate} ${currency.code}`,
            numberOfCoins
          ];
        });
      }
    }
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [
        BrowserModule,
        FormsModule
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(AppComponent);
    fixture.autoDetectChanges(true);
  }));

  it('should display available fiat balance', () => {
    const actual: string = get$.requestExchange.availableFiatBalanceAmount.value;
    const expected: string = help$.number.format.toString(profileDetails.availableFiatBalanceAmount);

    expect(actual).toBe(expected);
  });

  describe('Amount to be exchanged field', () => {
    describe('Initially', () => {
      it('should be equal to the entire available fiat balance', () => {
        const actual: string = get$.requestExchange.exchangeAmount.element.nativeElement.value;
        const expected: string = help$.number.format.toString(profileDetails.availableFiatBalanceAmount);

        expect(actual).toBe(expected);
      });

      it('should have no validation error messages', () => {
        const actual: DebugElement = get$.requestExchange.exchangeAmount.errors.element;

        expect(actual).toBeFalsy();
      });
    });

    it('should accept values from 0.01 to the entire available balance, inclusive', () => {
      `context: should reject any value less than 0.01`;
      {
        set$.requestExchange.exchangeAmount.element.value = make$.amountToBeExchanged.invalid.min.any.value;

        const actual: boolean = get$.requestExchange.exchangeAmount.element.nativeElement.checkValidity();

        expect(actual).toBeFalse();
      }

      `context: should reject the value one step before 0.01`;
      {
        set$.requestExchange.exchangeAmount.element.value = make$.amountToBeExchanged.invalid.min.boundary.value;

        const actual: boolean = get$.requestExchange.exchangeAmount.element.nativeElement.checkValidity();

        expect(actual).toBeFalse();
      }

      `context: should accept a value equal to 0.01`;
      {
        set$.requestExchange.exchangeAmount.element.value = make$.amountToBeExchanged.valid.min.value;

        const actual: boolean = get$.requestExchange.exchangeAmount.element.nativeElement.checkValidity();

        expect(actual).toBeTrue();
      }

      `context: should accept any value between 0.01 and available balance, inclusive`;
      {
        set$.requestExchange.exchangeAmount.element.value = make$.amountToBeExchanged.valid.any.value;

        const actual: boolean = get$.requestExchange.exchangeAmount.element.nativeElement.checkValidity();

        expect(actual).toBeTrue();
      }

      `context: should accept a value equal to the available balance`;
      {
        set$.requestExchange.exchangeAmount.element.value = make$.amountToBeExchanged.valid.max.value;

        const actual: boolean = get$.requestExchange.exchangeAmount.element.nativeElement.checkValidity();

        expect(actual).toBeTrue();
      }

      `context: should reject the value one step after the available balance`;
      {
        set$.requestExchange.exchangeAmount.element.value = make$.amountToBeExchanged.invalid.max.boundary.value;

        const actual: boolean = get$.requestExchange.exchangeAmount.element.nativeElement.checkValidity();

        expect(actual).toBeFalse();
      }

      `context: should reject any value that exceeds the available balance`;
      {
        set$.requestExchange.exchangeAmount.element.value = make$.amountToBeExchanged.invalid.max.any.value;

        const actual: boolean = get$.requestExchange.exchangeAmount.element.nativeElement.checkValidity();

        expect(actual).toBeFalse();
      }
    });

    it('should display the error message `Cannot be empty` if it is empty', () => {
      set$.requestExchange.exchangeAmount.element.value = '';

      const actual: string[] | undefined = get$.requestExchange.exchangeAmount.errors.messages;
      const expected: string[] = ['Cannot be empty'];

      expect(actual).toEqual(expected);
    });

    it('should display the error message `Cannot be less than $0.01` if it is less than 0.01', () => {
      set$.requestExchange.exchangeAmount.element.value = make$.amountToBeExchanged.invalid.min.any.value;

      const actual: string[] | undefined = get$.requestExchange.exchangeAmount.errors.messages;
      const expected: string[] = ['Cannot be less than $0.01'];

      expect(actual).toEqual(expected);
    });

    it('should display the error message `Cannot exceed available balance` if it exceeds the available balance', () => {
      set$.requestExchange.exchangeAmount.element.value = make$.amountToBeExchanged.invalid.max.any.value;

      const actual: string[] | undefined = get$.requestExchange.exchangeAmount.errors.messages;
      const expected: string[] = ['Cannot exceed the available balance'];

      expect(actual).toEqual(expected);
    });
  });

  describe('Cryptocurrency list', () => {
    describe('Initially', () => {
      it('should contain data calculated for the entire available balance', () => {
        const actual: string[][] = get$.cryptocurrencyList.rows.columns;
        const expected: string[][] = help$.cryptocurrencyList.calculate(help$.number.format.toString(profileDetails.availableFiatBalanceAmount));

        expect(actual).toEqual(expected);
      });
    });

    describe('When Exchange amount is valid', () => {
      it('should contain a valid "Number of coins" column', () => {
        const reference: string = make$.amountToBeExchanged.valid.any.value;

        set$.requestExchange.exchangeAmount.element.value = reference;

        const actual: string[][] = get$.cryptocurrencyList.rows.columns;
        const expected: string[][] = cryptocurrencyList.map<string[]>((currency: Cryptocurrency): string[] => {
          return [
            currency.name,
            `1 USD = ${currency.rate} ${currency.code}`,
            help$.number.format.toFixed(help$.number.set(reference) * currency.rate, 8)
          ];
        });

        expect(actual).toEqual(expected);
      });
    });

    describe('When Exchange amount is not valid', () => {
      it('should contain `n/a` in the "Number of coins" column', () => {
        const reference: string = make$.amountToBeExchanged.invalid.any.value;

        set$.requestExchange.exchangeAmount.element.value = reference;

        const actual: string[][] = get$.cryptocurrencyList.rows.columns;
        const expected: string[][] = help$.cryptocurrencyList.calculate(reference);

        expect(actual).toEqual(expected);
      });
    });
  });
});
