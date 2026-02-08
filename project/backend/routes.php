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
        '/corso/modifica'               => 'CourseController@update',
        '/corso/elimina'                => 'CourseController@delete',
        
        '/argomento/crea'               => 'ArgumentController@create',
        '/argomento/modifica'           => 'ArgumentController@update',
        '/argomento/elimina'            => 'ArgumentController@delete',

        '/appunto/crea'                 => 'NoteController@create',
        '/appunto/modifica'             => 'NoteController@update',
        '/appunto/elimina'              => 'NoteController@delete',
    ]
];