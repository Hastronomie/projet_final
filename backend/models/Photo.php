<?php

namespace models;

class Photo
{
    private $id;
    private $alt;
    private $date;
    private $caption;

    public function __construct($id, $alt, $date, $caption)
    {
        $this->id      = $id;
        $this->alt     = $alt;
        $this->date    = $date;
        $this->caption = $caption;
    }

    public function getId()      { return $this->id; }
    public function getAlt()     { return $this->alt; }
    public function getDate()    { return $this->date; }
    public function getCaption() { return $this->caption; }
}