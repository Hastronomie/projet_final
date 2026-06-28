import { AlbumModel } from '../models/AlbumModel.js';
import {AlbumListView} from "../views/templates/AlbumListView";
import {AlbumCreateView} from "../views/templates/AlbumCreateView";
import {AlbumDetailView} from "../views/templates/AlbumDetailView";
import {PhotoGalleryView} from "../views/templates/GalleryPhotoView";
import {AccessManagerView} from "../views/templates/AccessManagerView";

export class AlbumController {
    constructor() {
        this.albumModel = new AlbumModel();
        this.albumListView     = new AlbumListView();
this.albumCreateView   = new AlbumCreateView();
this.albumDetailView   = new AlbumDetailView();
this.photoGalleryView  = new PhotoGalleryView();
this.accessManagerView = new AccessManagerView();
    }

    async initialize() {
        try {
            const albumsData = await this.albumModel.fetchAlbums();
            this.albumView.render(albumsData);
        } catch (error) {
            this.albumView.renderError(error.message);
        }
    }
}