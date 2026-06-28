import { PhotoModel } from '../models/PhotoModel.js';
import { PhotoView } from '../views/templates/PhotoView.js';

export class PhotoController {
    constructor() {
        this.photoModel = new PhotoModel();
        this.photoView = new PhotoView();
    }

    async loadByAlbum(albumId) {
        try {
            const photos = await this.photoModel.fetchByAlbumId(albumId);
            this.photoView.renderGallery(photos);
        } catch (error) {
            this.photoView.renderError(error.message);
        }
    }

    async upload(formData) {
        try {
            const response = await this.photoModel.uploadPhoto(formData);
            this.photoView.renderSuccess(response);
        } catch (error) {
            this.photoView.renderError(error.message);
        }
    }
}