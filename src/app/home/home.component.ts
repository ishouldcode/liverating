import { HttpClient } from '@angular/common/http';
import { ViewChild } from '@angular/core';
import { Component, ElementRef, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  @ViewChild('addCategoryItemInput') addCategoryItemInput: ElementRef;

  public categories: string[] = [
    'games',
    'movies',
    'anime',
    'manga'
  ]


  public isLoading: boolean = false;
  public currentCategory: BehaviorSubject<string>;

  public inputPlaceholder: string;

  public list: AppModel[] = [];



  constructor(private http: HttpClient) {

  }

  ngOnInit(): void {
    this.categories = this.categories.sort();
    this.currentCategory = new BehaviorSubject<string>(this.categories[0]);
    this.currentCategory.subscribe(currentCategory => {
      currentCategory = currentCategory.charAt(currentCategory.length - 1) === 's' ? currentCategory.substring(0, currentCategory.length - 1) : currentCategory;
      this.inputPlaceholder = `Enter a ${currentCategory}`;
    });
    this.list = this.list.sort((a, b) => b.votes - a.votes)

    this.fetchList();
  }

  vote(id: number, upvote: boolean): void {
    const item = this.list.find(item => item.id == id);
    if (upvote)
      item.votes++;
    else
      item.votes--;

    this.http.post('api/list', item).subscribe(res => {
      console.log(res);
    });
    this.list = this.list.sort((a, b) => b.votes - a.votes);
  }

  fetchList(): void {
    this.isLoading = true;
    this.http.get('api/list').subscribe((list: AppModel[]) => {
      this.list = list.filter(item => item.category === this.currentCategory.value)
        .sort((a, b) => b.votes - a.votes);
      this.isLoading = false;
    });
  }

  changeCategory(category: string): void {
    this.currentCategory.next(category);
    this.isLoading = true;
    this.http.get('api/list').subscribe((list: AppModel[]) => {
      this.list = list.filter(a => a.category === category).sort((a, b) => b.votes - a.votes);;
      this.isLoading = false;
    });
  }

  addCategoryItem(item: string): void {
    this.addCategoryItemInput.nativeElement.value = '';

    const obj: AppModel = {
      name: item,
      category: this.currentCategory.value,
      votes: 0
    }
    this.http.post('/api/list', obj).subscribe(res => console.log(res));
    this.fetchList();
  }

}

export interface AppModel {
  id?: number;
  name: string,
  votes: number;
  category: string;
}