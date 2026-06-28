import { AlbumModel }        from '../models/AlbumModel.js';
import { PhotoModel }        from '../models/PhotoModel.js';
import { PERM }              from '../core/Permission.js';
import { AlbumListView }     from '../views/templates/AlbumListView.js';
import { AlbumCreateView }   from '../views/templates/AlbumCreateView.js';
import { AlbumDetailView }   from '../views/templates/AlbumDetailView.js';
import { GalleryPhotoView }  from '../views/templates/GalleryPhotoView.js';
import { AccessManagerView } from '../views/templates/AccessManagerView.js';

export class AlbumController {
    constructor() {
        this.albumModel        = new AlbumModel();
        this.photoModel        = new PhotoModel();

        this.albumListView     = new AlbumListView();
        this.albumCreateView   = new AlbumCreateView();
        this.albumDetailView   = new AlbumDetailView();
        this.photoGalleryView  = new GalleryPhotoView();
        this.accessManagerView = new AccessManagerView();
    }

    async initialize() {
        try {
            // Alignement matériel sur l'identifiant exact du modèle
            const albumsData = await this.albumModel.fetchAll();

            this.albumListView.renderList(albumsData);

            this.albumListView.bindGoToCreate(() => this.showCreationForm());
            this.albumListView.bindViewAlbum((albumId) => this.show(albumId));
            this.albumListView.bindDeleteAlbum(async (albumId) => {
                try {
                    await this.albumModel.deleteAlbum(albumId); // Alignement matériel
                    this.initialize();
                } catch (error) {
                    this.albumListView.renderError(error.message);
                }
            });
        } catch (error) {
            this.albumListView.renderError(error.message);
        }
    }

    showCreationForm() {
        this.albumCreateView.renderCreateAlbumForm();
        this.albumCreateView.bindVisibilityToggle();

        this.albumCreateView.bindCreateAlbumSubmit(async (albumData) => {
            try {
                await this.albumModel.createAlbum(albumData);
                await this.initialize();
            } catch (error) {
                this.albumCreateView.renderError(error.message);
            }
        });

        this.albumCreateView.bindCancelCreate(() => this.initialize());
    }

    async show(albumId) {
        try {
            const [album, photos] = await Promise.all([
                this.albumModel.fetchById(albumId),
                this.photoModel.fetchByAlbumId(albumId)
            ]);

            this.albumDetailView.renderDetail(album);
            this.photoGalleryView.renderGallery(photos);

            this.#bindGalleryInteractions(albumId, album.user_permission);

            this.albumDetailView.bindBackToList(() => this.initialize());

            if (album.user_permission >= PERM.OWNER) {
                this.albumDetailView.bindUpdateVisibility(async (newVisibility) => {
                    try {
                        await this.albumModel.updateVisibility(albumId, newVisibility);
                        await this.show(albumId);
                    } catch (error) {
                        this.albumDetailView.renderError(error.message);
                    }
                });
            }

            if (album.user_permission >= PERM.MODIFY) {
                this.albumDetailView.bindAddPhoto(() => this.showUploadForm(albumId));
                this.albumDetailView.bindEditDescription(album, async (newDescription) => {
                    try {
                        await this.albumModel.updateDescription(albumId, newDescription);
                        await this.show(albumId);
                    } catch (error) {
                        alert("REJET SERVEUR (Description) : " + error.message);
                    }
                });
            }

            if (album.user_permission >= PERM.OWNER) {
                this.albumDetailView.bindManageAccess(() => this.showAccessManager(albumId));
            }

        } catch (error) {
            this.albumDetailView.renderError(error.message);
        }
    }

    #bindGalleryInteractions(albumId, currentPermission) {
        this.#bindGalleryDelete(albumId, currentPermission);

        this.photoGalleryView.bindOpenPhoto(async (photoId) => {
            try {
                const photos = await this.photoModel.fetchByAlbumId(albumId);
                const targetPhoto = photos.find(p => p.id == photoId);
                if (!targetPhoto) throw new Error("Photo introuvable.");

                await this.#openPhotoCommentSequence(photoId, targetPhoto.alt, currentPermission);
            } catch (error) {
                this.photoGalleryView.renderError(error.message);
            }
        });
    }

    async #openPhotoCommentSequence(photoId, photoUrl, permissionLevel) {
        try {
            const comments = await this.photoModel.fetchComments(photoId);
            this.photoGalleryView.renderPhotoModal(photoUrl, comments, permissionLevel);
            this.photoGalleryView.bindCloseModal();

            if (permissionLevel >= PERM.COMMENT) {
                this.photoGalleryView.bindSubmitComment(async (content) => {
                    try {
                        await this.photoModel.postComment(photoId, content);
                        this.photoGalleryView.closeModal();
                        await this.#openPhotoCommentSequence(photoId, photoUrl, permissionLevel);
                    } catch (postError) {
                        alert("REJET SERVEUR : " + postError.message);
                    }
                });
            }
        } catch (error) {
            this.photoGalleryView.renderError(error.message);
        }
    }

    async showAccessManager(albumId) {
        try {
            const users = await this.albumModel.getAlbumUsers(albumId);
            this.accessManagerView.renderAccessManager(users);

            this.accessManagerView.bindInviteSubmit(async (email, permission) => {
                try {
                    await this.albumModel.invite(albumId, email, permission);
                    await this.showAccessManager(albumId);
                } catch (error) {
                    alert("REJET MATÉRIEL : " + error.message);
                }
            });

            this.accessManagerView.bindUpdateAccess(async (userId, newPerm) => {
                try {
                    await this.albumModel.updateUserAccess(albumId, userId, newPerm);
                    await this.showAccessManager(albumId);
                } catch (error) {
                    this.accessManagerView.renderError(error.message);
                }
            });

            this.accessManagerView.bindRemoveAccess(async (userId) => {
                try {
                    await this.albumModel.removeUserAccess(albumId, userId);
                    await this.showAccessManager(albumId);
                } catch (error) {
                    this.accessManagerView.renderError(error.message);
                }
            });

            this.accessManagerView.bindBackToAlbum(() => this.show(albumId));

        } catch (error) {
            this.accessManagerView.renderError(error.message);
        }
    }

    async #refreshGallery(albumId, permissionLevel) {
        const photos = await this.photoModel.fetchByAlbumId(albumId);
        this.photoGalleryView.renderGallery(photos);
        this.#bindGalleryInteractions(albumId, permissionLevel);
    }

    #bindGalleryDelete(albumId, permissionLevel) {
        this.photoGalleryView.bindDeletePhoto(async (photoId) => {
            try {
                await this.photoModel.deletePhoto(photoId);
                await this.#refreshGallery(albumId, permissionLevel);
            } catch (error) {
                this.photoGalleryView.renderError(error.message);
            }
        });
    }

    showUploadForm(albumId) {
        this.photoGalleryView.renderUploadForm(albumId);
        this.photoGalleryView.bindPhotoDropZone();
        this.photoGalleryView.bindSubmitPhoto(async (fileObject) => {
            try {
                const payload = new FormData();
                payload.append('photo', fileObject);
                payload.append('album_id', albumId);
                await this.photoModel.uploadPhoto(payload);
                await this.show(albumId);
            } catch (error) {
                this.photoGalleryView.renderError(error.message);
            }
        });
        this.photoGalleryView.bindCancelUpload(() => this.show(albumId));
    }

    async deleteAlbumSequence(albumId) {
        try {
            await this.albumModel.deleteAlbum(albumId);
            await this.initialize();
        } catch (error) {
            this.albumListView.renderError(error.message);
        }
    }
}