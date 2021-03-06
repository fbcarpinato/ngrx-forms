import { Component, getDebugNode } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgrxRadioViewAdapter } from './radio';

const TEST_ID = 'test ID';

const OPTION1_VALUE = 'op1';
const OPTION2_VALUE = 'op2';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'radio-test',
  template: `
<input type="radio" value="op1" [ngrxFormControlState]="state" />
<input type="radio" value="op2" checked="checked" [ngrxFormControlState]="state" />

<input type="radio" *ngFor="let o of stringOptions; trackBy: trackByIndex" [value]="o" [ngrxFormControlState]="state" />

<input type="radio" *ngFor="let o of numberOptions; trackBy: trackByIndex" [value]="o" [ngrxFormControlState]="state" />

<input type="radio" *ngFor="let o of booleanOptions; trackBy: trackByIndex" [value]="o" [ngrxFormControlState]="state" />
`,
})
export class RadioTestComponent {
  stringOptions = ['op1', 'op2'];
  numberOptions = [1, 2];
  booleanOptions = [true, false];
  state = { id: TEST_ID } as any;
  trackByIndex = (index: number) => index;
}

describe(NgrxRadioViewAdapter.name, () => {
  let component: RadioTestComponent;
  let fixture: ComponentFixture<RadioTestComponent>;
  let viewAdapter1: NgrxRadioViewAdapter;
  let viewAdapter2: NgrxRadioViewAdapter;
  let element1: HTMLInputElement;
  let element2: HTMLInputElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        NgrxRadioViewAdapter,
        RadioTestComponent,
      ],
    }).compileComponents();
  }));

  describe('static options', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(RadioTestComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      element1 = (fixture.nativeElement as HTMLElement).querySelectorAll('input')[0] as HTMLInputElement;
      element2 = (fixture.nativeElement as HTMLElement).querySelectorAll('input')[1] as HTMLInputElement;
      viewAdapter1 = getDebugNode(element1)!.injector.get(NgrxRadioViewAdapter);
      viewAdapter2 = getDebugNode(element2)!.injector.get(NgrxRadioViewAdapter);
    });

    it('should attach the view adapter', () => expect(viewAdapter1).toBeDefined());

    it('should set the name of the elements', () => {
      expect(element1.name).toBe(TEST_ID);
      expect(element2.name).toBe(TEST_ID);
    });

    it('should set the name of the elements when the state\'s ID changes', () => {
      const newId = 'new ID';
      viewAdapter1.ngrxFormControlState = { id: newId } as any;
      viewAdapter2.ngrxFormControlState = { id: newId } as any;
      fixture.detectChanges();
      expect(element1.name).toBe(newId);
      expect(element2.name).toBe(newId);
    });

    it('should mark the option as checked if same value is written', () => {
      viewAdapter1.setViewValue(OPTION1_VALUE);
      expect(element1.checked).toBe(true);
    });

    it('should mark the option as unchecked if different value is written', () => {
      element1.checked = true;
      viewAdapter1.setViewValue(OPTION2_VALUE);
      expect(element1.checked).toBe(false);
    });

    it('should call the registered function whenever the value changes', () => {
      const spy = jasmine.createSpy('fn');
      viewAdapter1.setOnChangeCallback(spy);
      element1.checked = true;
      element1.dispatchEvent(new Event('change'));
      expect(spy).toHaveBeenCalledWith(OPTION1_VALUE);
    });

    it('should call the registered function whenever the input is blurred', () => {
      const spy = jasmine.createSpy('fn');
      viewAdapter1.setOnTouchedCallback(spy);
      element1.dispatchEvent(new Event('blur'));
      expect(spy).toHaveBeenCalled();
    });

    it('should disable the input', () => {
      viewAdapter1.setIsDisabled(true);
      expect(element1.disabled).toBe(true);
    });

    it('should enable the input', () => {
      element1.disabled = true;
      viewAdapter1.setIsDisabled(false);
      expect(element1.disabled).toBe(false);
    });

    it('should throw if state is undefined', () => {
      expect(() => viewAdapter1.ngrxFormControlState = undefined as any).toThrowError();
    });
  });

  describe('dynamic string options', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(RadioTestComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      element1 = (fixture.nativeElement as HTMLElement).querySelectorAll('input')[2] as HTMLInputElement;
      element2 = (fixture.nativeElement as HTMLElement).querySelectorAll('input')[3] as HTMLInputElement;
      viewAdapter1 = getDebugNode(element1)!.injector.get(NgrxRadioViewAdapter);
      viewAdapter2 = getDebugNode(element2)!.injector.get(NgrxRadioViewAdapter);
      viewAdapter1.setViewValue(component.stringOptions[1]);
      viewAdapter2.setViewValue(component.stringOptions[1]);
    });

    it('should mark the option as checked if same value is written', () => {
      viewAdapter1.setViewValue(component.stringOptions[0]);
      viewAdapter2.setViewValue(component.stringOptions[0]);
      expect(element1.checked).toBe(true);
    });

    it('should mark the option as unchecked if different value is written', () => {
      element1.checked = true;
      viewAdapter1.setViewValue(component.stringOptions[1]);
      viewAdapter2.setViewValue(component.stringOptions[1]);
      expect(element1.checked).toBe(false);
    });

    it('should call the registered function whenever the value changes', () => {
      const spy = jasmine.createSpy('fn');
      viewAdapter1.setOnChangeCallback(spy);
      viewAdapter2.setOnChangeCallback(spy);
      element1.checked = true;
      element1.dispatchEvent(new Event('change'));
      expect(spy).toHaveBeenCalledWith(component.stringOptions[0]);
    });

    it('should call the registered function whenever the selected option\'s value changes', () => {
      const spy = jasmine.createSpy('fn');
      viewAdapter1.setOnChangeCallback(spy);
      viewAdapter2.setOnChangeCallback(spy);
      const newValue = 'new value';
      component.stringOptions[1] = newValue;
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith(newValue);
    });

    it('should not call the registered function whenever an unselected option\'s value changes', () => {
      const spy = jasmine.createSpy('fn');
      viewAdapter1.setOnChangeCallback(spy);
      viewAdapter2.setOnChangeCallback(spy);
      const newValue = 'new value';
      component.stringOptions[0] = newValue;
      fixture.detectChanges();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should create new options dynamically', () => {
      const spy = jasmine.createSpy('fn');
      viewAdapter1.setOnChangeCallback(spy);
      viewAdapter2.setOnChangeCallback(spy);
      const newValue = 'op3';
      component.stringOptions.push(newValue);
      fixture.detectChanges();
      const newElement = (fixture.nativeElement as HTMLElement).querySelectorAll('input')[4] as HTMLInputElement;
      const newViewAdapter = getDebugNode(newElement)!.injector.get(NgrxRadioViewAdapter);
      newViewAdapter.setOnChangeCallback(spy);
      newElement.checked = true;
      newElement.dispatchEvent(new Event('change'));
      expect(spy).toHaveBeenCalledWith(newValue);
    });
  });

  describe('dynamic number options', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(RadioTestComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      element1 = (fixture.nativeElement as HTMLElement).querySelectorAll('input')[4] as HTMLInputElement;
      element2 = (fixture.nativeElement as HTMLElement).querySelectorAll('input')[5] as HTMLInputElement;
      viewAdapter1 = getDebugNode(element1)!.injector.get(NgrxRadioViewAdapter);
      viewAdapter2 = getDebugNode(element2)!.injector.get(NgrxRadioViewAdapter);
      viewAdapter1.setViewValue(component.numberOptions[1]);
      viewAdapter2.setViewValue(component.numberOptions[1]);
    });

    it('should mark the option as checked if same value is written', () => {
      viewAdapter1.setViewValue(component.numberOptions[0]);
      viewAdapter2.setViewValue(component.numberOptions[0]);
      expect(element1.checked).toBe(true);
    });

    it('should mark the option as unchecked if different value is written', () => {
      element1.checked = true;
      viewAdapter1.setViewValue(component.numberOptions[1]);
      viewAdapter2.setViewValue(component.numberOptions[1]);
      expect(element1.checked).toBe(false);
    });

    it('should call the registered function whenever the value changes', () => {
      const spy = jasmine.createSpy('fn');
      viewAdapter1.setOnChangeCallback(spy);
      viewAdapter2.setOnChangeCallback(spy);
      element1.checked = true;
      element1.dispatchEvent(new Event('change'));
      expect(spy).toHaveBeenCalledWith(component.numberOptions[0]);
    });

    it('should call the registered function whenever the selected option\'s value changes', () => {
      const spy = jasmine.createSpy('fn');
      viewAdapter1.setOnChangeCallback(spy);
      viewAdapter2.setOnChangeCallback(spy);
      const newValue = 3;
      component.numberOptions[1] = newValue;
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith(newValue);
    });

    it('should not call the registered function whenever an unselected option\'s value changes', () => {
      const spy = jasmine.createSpy('fn');
      viewAdapter1.setOnChangeCallback(spy);
      viewAdapter2.setOnChangeCallback(spy);
      const newValue = 3;
      component.numberOptions[0] = newValue;
      fixture.detectChanges();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should create new options dynamically', () => {
      const spy = jasmine.createSpy('fn');
      viewAdapter1.setOnChangeCallback(spy);
      viewAdapter2.setOnChangeCallback(spy);
      const newValue = 3;
      component.numberOptions.push(newValue);
      fixture.detectChanges();
      const newElement = (fixture.nativeElement as HTMLElement).querySelectorAll('input')[6] as HTMLInputElement;
      const newViewAdapter = getDebugNode(newElement)!.injector.get(NgrxRadioViewAdapter);
      newViewAdapter.setOnChangeCallback(spy);
      newElement.checked = true;
      newElement.dispatchEvent(new Event('change'));
      expect(spy).toHaveBeenCalledWith(newValue);
    });
  });

  describe('dynamic boolean options', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(RadioTestComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      element1 = (fixture.nativeElement as HTMLElement).querySelectorAll('input')[6] as HTMLInputElement;
      element2 = (fixture.nativeElement as HTMLElement).querySelectorAll('input')[7] as HTMLInputElement;
      viewAdapter1 = getDebugNode(element1)!.injector.get(NgrxRadioViewAdapter);
      viewAdapter2 = getDebugNode(element2)!.injector.get(NgrxRadioViewAdapter);
      viewAdapter1.setViewValue(component.booleanOptions[1]);
      viewAdapter2.setViewValue(component.booleanOptions[1]);
    });

    it('should mark the option as checked if same value is written', () => {
      viewAdapter1.setViewValue(component.booleanOptions[0]);
      viewAdapter2.setViewValue(component.booleanOptions[0]);
      expect(element1.checked).toBe(true);
    });

    it('should mark the option as unchecked if different value is written', () => {
      element1.checked = true;
      viewAdapter1.setViewValue(component.booleanOptions[1]);
      viewAdapter2.setViewValue(component.booleanOptions[1]);
      expect(element1.checked).toBe(false);
    });

    it('should call the registered function whenever the value changes', () => {
      const spy = jasmine.createSpy('fn');
      viewAdapter1.setOnChangeCallback(spy);
      viewAdapter2.setOnChangeCallback(spy);
      element1.checked = true;
      element1.dispatchEvent(new Event('change'));
      expect(spy).toHaveBeenCalledWith(component.booleanOptions[0]);
    });

    it('should call the registered function whenever the selected option\'s value changes', () => {
      const spy = jasmine.createSpy('fn');
      viewAdapter1.setOnChangeCallback(spy);
      viewAdapter2.setOnChangeCallback(spy);
      const newValue = true;
      component.booleanOptions[1] = newValue;
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith(newValue);
    });

    it('should not call the registered function whenever an unselected option\'s value changes', () => {
      const spy = jasmine.createSpy('fn');
      viewAdapter1.setOnChangeCallback(spy);
      viewAdapter2.setOnChangeCallback(spy);
      const newValue = true;
      component.booleanOptions[0] = newValue;
      fixture.detectChanges();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should create new options dynamically', () => {
      const spy = jasmine.createSpy('fn');
      viewAdapter1.setOnChangeCallback(spy);
      viewAdapter2.setOnChangeCallback(spy);
      const newValue = true;
      component.booleanOptions.push(newValue);
      fixture.detectChanges();
      const newElement = (fixture.nativeElement as HTMLElement).querySelectorAll('input')[8] as HTMLInputElement;
      const newViewAdapter = getDebugNode(newElement)!.injector.get(NgrxRadioViewAdapter);
      newViewAdapter.setOnChangeCallback(spy);
      newElement.checked = true;
      newElement.dispatchEvent(new Event('change'));
      expect(spy).toHaveBeenCalledWith(newValue);
    });
  });
});
