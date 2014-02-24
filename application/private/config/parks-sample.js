
/**
 * Config theme class: Parks
 * @file: /application/private/config/parks.js
 * @author: Vladimir Bukhin
 * @Description: Here lies the configurables having to do with the graffiti theme specifically.
 * This is the first configuration for the observer server and should be used as an example for
 * future configurations. Documentation is included here.
 */
var typeConf={
    system_info: {
        /*****
         *  heroku:
         *      @app_server_name: the heroku server application that is going to hold all this code and run with the parks command line param.
         *      @cdn_server_name: heroku app used to server images. Can be shared over multiple types as long as the grid store is also shared.
         *
         *  mongo:
         *      @document_store: mongolab uri for the document store db. Must be different for each type.
         *      @grid_store: the grid db that your cdn app uses.
         */
        heroku:{
            cdn_server_name: 'cdn-server-name' //create another heroku app for this or use one for all.
        },
        mongo_uri:{
            document_store: 'yourMongoURL',
            grid_store: 'yourMongoURL'
        }
    },
    /*****
     *  @ui_label: String representation for UI
     *  @db_field_name: use underascore instead of space, all lower case. This is db key name. No special chars.
     *  @index: 'non-unique'/'unique'/'spatial' if index necessary, otherwise done include key.
     *  @configurable: this tells us in the field object that it's a non-standard field.
     *
     *  DISCRETE Fields
     *  @discrete_fields: options that will be in a filter-data dropdown. If just name then value=name.
     *  @filterable: True if we want to add this to map/list filters.
     *
     *  OPEN FIELDS
     *  @num_text_area_rows: Number of rows of input if more than one.
     *
     *  Other important configurables:
     *  Logo image: /observerAPIWebApp/web/public/images/logo.png
     *  Home Tab: /observerAPIWebApp/web/private/view/ejs/homeTab.ejs
     */
    fields:[//dateTime, GPS/address, media already included
        {
            ui_label: 'Type of Issue',
            db_field_name: 'issue_type',
            index: 'non-unique',
            configurable: true,

            discrete_fields: [
                {name: 'Broken Bench'},
                {name: 'Fallen Tree'},
                {name: 'Missing Sign'},
                {name: 'Other'}
            ],
            filterable: true,
            addForm: true,
            required: true
        },
        {
            ui_label: 'Description',
            db_field_name: 'description',
            configurable: true,

            num_text_area_rows: 3,
            addForm: true
        },
        {
            ui_label: 'Issue Marked Complete',
            db_field_name: 'completed',
            index: 'non-unique',
            tooltip_description: 'Indicates that a manager marked this issue complete.',
            configurable: true,
            checkbox: true,
            filterable: true,
            discrete_fields: [
                {name: 'No'},
                {name: 'Yes'}
            ]
        }

    ],
    text:{
        pageHeader: "Parks Observer",
        headerSubtext: "Help report problem areas in our parks."
    },
    //these can be relative paths to the public directory or full urls. The string is placed directly in img src attribute.
    images: {
        logo: '/images/parksLogo.png'
    },
    home: [//each of these ends with a hyperlink and the word 'here' and a period
        //linkName can be: map,list,about,manage,send
        {
            title: 'Submit Observations to Better maintain parks.',
            subtext: 'Anyone can help keep parks clean and safe for everyone to enjoy by submitting safety or cleanliness' +
                ' issues to this website. Anyone can see the map and park maintenance can use it to correct the issues. Learn more ',
            linkName: 'about'
        },
        {
            title: 'How To Participate?',
            subtext: 'Simply submit issues from your current location ',
            linkName: 'send'
        },
        {
            title: 'Work for a Park Service?',
            subtext: 'If you are interested in providing solutions to these issues, managing the data on this site, or ' +
                'maintaining a site just like this one, click ',
            linkName: 'manage'
        }
    ],
    about:{
        images:{
            main: '/images/parksAbout.jpg',
            user: '/images/parksUser.jpg',
            manager: '/images/parksData_manager.jpg'
        },
        text: 'The Parks Observer website is designed to allow anyone to be able to submit or view observations that describe problems in parks. '+
            'The user can submit their observations with an image and additional text information. In addition the user can view all observations '+
            'on a map or in a table. In each observation viewing area the user can filter by different parts of the observation.' +
            ' This website was created as a thesis project in 2012-2013, focuses on user-centered design principles, configurability, and large data storage' +
            ' techniques. At the bottom of this page, you will find contact information about the development team involved.',
        team:{
            Developer:{
                name: 'Vladimir Bukhin',
                text: 'Vladimir is the lead developer of the website for his culminating experience at SF State. He is mainly interested in high level system architecture design.',
                email: 'vbukhin@sfsu.edu',
                photo: '/images/vlad.jpg'
            },
            'Committee Member 1':{
                name: 'Marguerite Murphy',
                text: 'Dr. Marguerite Murphy is a professor at San Francisco State Department of Computer Sciences and is the lead committee member involved in the construction ' +
                    'of this culminating experience project. Her interests include Database systems, Computer networks, Operating systems, Multimedia systems, and Bioinformatics.',
                email: 'mmurphy@sfsu.edu',
                photo: 'http://cs.sfsu.edu/faculty/directory_images/murphy.jpg'
            },
            'Committee Member 2':{
                name: 'Dragutin Petkovic',
                text: 'Dr. Dragutin Petkovic is Chair of the San Francisco State Department of Computer Sciences and Director of the Center for Computing for Life Sciences.'+
                    ' He is interested in the use of computational tools in life sciences as well as making all things (e.g. WWW) easier to use. He is helping this project' +
                    ' by contributing to its frontend design and mentoring SFSU Computer Science students to develop it with the latest technology and modern software ' +
                    'engineering methods.',
                email: 'petkovic@sfsu.edu',
                photo: 'http://cs.sfsu.edu/faculty/directory_images/petkovic.jpg'
            }
            ,

            Configurer: {//Only if different.
                name: 'Vladimir Bukhin',
                text:'Vladimir Bukhin: Same as developer',
                email: 'vbukhin@sfsu.edu',
                photo: '/images/vlad.jpg'
            }
        }

    },
    managers:{
        credentials:{//key is username, value is password
            'manager': 'yourManagerPass'
        }
    }
};

module.exports = typeConf;
