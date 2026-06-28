<?php

namespace models;

class User
{
    private $id;
    private $name;
    private $pronoun;
    private $email;
    private $password;
    private ?string $username;
    private ?string $photo;

    public function __construct($id, $name, $pronoun, $email, $password, $username = null, $photo = null)
    {
        $this->id       = $id;
        $this->name     = $name;
        $this->pronoun  = $pronoun;
        $this->email    = $email;
        $this->password = $password;
        $this->username = $username;
        $this->photo    = $photo;
    }

    public function getId()       { return $this->id; }
    public function getName()     { return $this->name; }
    public function getPronoun()  { return $this->pronoun; }
    public function getEmail()    { return $this->email; }
    public function getPassword() { return $this->password; }
    public function getUsername() { return $this->username; }
    public function getPhoto()    { return $this->photo; }
}