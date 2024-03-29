import { Component,  Input, OnInit, AfterViewInit } from '@angular/core';
import { BotsService } from '../services/bots.service';
import { kebabToTitleCase } from '../utils';
import { Tag } from '../services/tag.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'bots',
  templateUrl: './bots.component.html',
  styleUrls: ['./bots.component.css']
})
export class BotsComponent implements OnInit, AfterViewInit {
  @Input() tag: Tag;
  @Input() ownerUser: any;

  page = 1;
  size = 8;

  title = 'Top';
  icon = 'fas fa-robot';
  description = 'The highest rated bots this week.';
  query = '';

  bots = [];
  savedBots = [];

  initialized = false;

  get lastPage() { return Math.ceil(this.bots.length / this.size); }

  constructor(
    public service: BotsService,
    private location: Location) {}

  async ngOnInit() {
    await this.service.init();

    if (this.tag)
      this.searchByTag(this.tag);
    else if (this.ownerUser)
      this.showUserBots(this.ownerUser);
    else
      this.loadTopBots();

    this.initialized = true;
  }

  ngAfterViewInit() {
    this.resetPaginator();
  }

  private resetPaginator(page = 1) {
    this.page = page;
  }

  private loadTopBots(page = 1) {
    const { bots, saved } = this.service.getTopBots();
    this.bots = bots;
    this.savedBots = saved;

    this.resetPaginator(page);
  }  
  search(query: string) {
    this.query = query;

    const { bots, saved } = this.service.searchBots(query);
    this.bots = bots;
    this.savedBots = saved;
    
    this.resetPaginator();
      
    (query.length > 0)
      ? this.setSearchLayout()
      : this.setDefaultLayout();
  }
  searchByTag(tag: Tag) { 
    var bots = [],
        saved = [];

    if (tag.name === 'featured')
      var { bots, saved } = this.service.getFeaturedBots();
    else if (tag.name === 'new')
      var { bots, saved } = this.service.getNewBots();
    else
      var { bots, saved } = this.service.getTaggedBots(tag.name);

    this.bots = bots;
    this.savedBots = saved;

    this.setTagLayout(tag);
  }
  showUserBots(user: any) {
    const { bots, saved } = this.service.getTopBots();
    this.savedBots = saved.filter(sb => sb.ownerId === user.id);
    this.bots = bots.filter(b => 
      this.savedBots.some(sb => sb._id === b.id));

    this.setUserBotsLayout(user);
  }

  private setDefaultLayout() {
    this.title = 'Top';
    this.icon = 'fas fa-robot';
    this.description = 'The highest rated bots this week.'

    this.loadTopBots();

    this.location.go('');
  }
  private setSearchLayout() {
    this.title = `Results for '${this.query}'`;
    this.description = `Find bots similar to '${this.query}'.`
    this.icon = 'fas fa-search';
  }
  private setTagLayout(tag: Tag) {
    this.title = `${kebabToTitleCase(tag.name)} Bots`;
    this.icon = tag.icon;
    this.description = tag.description;
    this.tag = tag;
    
    this.resetPaginator();
  }
  private setUserBotsLayout(user: any) {
    this.title = `${user.username} Bots`;
    this.description = `This user has ${this.bots.length} bots on DBots.`;
  }

  previousPage() {
    this.page = Math.max(this.page - 1, 1);
  }
  nextPage() {
    this.page = Math.min(this.page + 1, this.lastPage);
  }
  
  paginate(array: any[]) {
    return array.slice((this.page - 1) * this.size, this.page * this.size);
  }
}
