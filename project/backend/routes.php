<?php
// backend/routes.php

return [
    'GET' => [
        '/corsi'                        => 'CourseController@index',

        '/argomenti'                    => 'ArgumentController@index',

        '/appunti'                      => 'NoteController@index',
        '/appunto'                      => 'NoteController@show',
        '/cerca'                        => 'NoteController@search',

        '/appunto/storia'               => 'VersionController@index',
        '/appunto/versione/visualizza'  => 'VersionController@show',
    ],
    'POST' => [
        '/login'                        => 'AuthController@login',
        '/logout'                       => 'AuthController@logout',
        '/register'                     => 'AuthController@register',
        
        '/appunto/versione/salva'       => 'VersionController@save',
        '/appunto/versione/ripristina'  => 'VersionController@restore',
        
        '/corso/crea'                   => 'CourseController@create',
        
        '/argomento/crea'               => 'ArgumentController@create',

        '/appunto/crea'                 => 'NoteController@create',
    ],
    'PUT' => [
        '/corso/modifica'               => 'CourseController@update',

        '/argomento/modifica'           => 'ArgumentController@update',

        '/appunto/modifica'             => 'NoteController@update',
    ],
    'DELETE' => [
        '/appunto/elimina'              => 'NoteController@delete',

        '/argomento/elimina'            => 'ArgumentController@delete',
        
        '/corso/elimina'                => 'CourseController@delete',
    ]
];