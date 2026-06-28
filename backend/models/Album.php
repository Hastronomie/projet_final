<?php

namespace models;

class Album
{
    private $id;
    private $name;
    private $visibility;
    private $description = '';
    private ?string $lastPhoto     = null;
    private int     $userPermission = 0; // permission de l'utilisateur courant sur cet album

    public function __construct($id, $name, $visibility, $description = '')
    {
        $this->id          = $id;
        $this->name        = $name;
        $this->visibility  = $visibility;
        $this->description = $description;
    }


    // Mutateur standard
    public function setDescription(?string $description): void
    {
        $this->description = $description ?? '';
    }

    public function getId()             { return $this->id; }
    public function getName()           { return $this->name; }
    public function getVisibility()     { return $this->visibility; }
    public function getDescription()    { return $this->description; }

    public function setLastPhoto(?string $path): void    { $this->lastPhoto = $path; }
    public function getLastPhoto(): ?string              { return $this->lastPhoto; }

    public function setUserPermission(int $p): void      { $this->userPermission = $p; }
    public function getUserPermission(): int             { return $this->userPermission; }
}