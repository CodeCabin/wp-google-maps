# WP Go Maps V9 - Public Repo
Welcome to the official WP Go Maps (formerly WP Google Maps) public GitHub repo.

In most cases this repo should match the SVN release within a few days from it's release. With that said, this does not represent an active working copy of upcoming releases. This is to say that internal repos do exist where the bulk of our development happens. Once a release is considered final, and released to the public, this code base is updated. 

The main reason for this workflow is to allow us to only release built versions of the core to the public, as errors may occur when using developer copies. If you need a more up to date developer release, you can get in touch with us on our site at any time: 
- https://www.wpgmaps.com/

## Having trouble with the plugin?
If you are having trouble with the base plugin or any of our add-ons, you are welcome to log an issue here. If your bug report includes a potential patch, you will be added to our in-plugin credits using your GitHub name and tag. 

Someone from our team will have a look at your issue, move it to an internal repo (to be patched) and provide you with feedback on the release/solution. 

If you have a translation file you would like to have added to the plugin, you can add this to an issue here, or submit it to us directly via our website. We offer all translators the option to receive a 1 site Pro add-on license in exchange for their time. 

For developers who contribute actively to our core code, we also offer free Pro add-ons and upgrades, to help support further improvements of the plugin in the future. Get in touch with us on via our website contact form to learn more: https://www.wpgmaps.com/contact-us/

## I have a feature request/idea
Please share it with us by logging a new issue with the phrase "Feature Request" in the title, or by using the `enhancement` tag on this repo. In some cases a feature may already have been requested and may be in the works on our end. Either way, someone from our team will let you know and ask any questions we may have about the request!

## I am a developer, is there anything I should look out for?
Yes, developers tend to enable developer mode. At this stage, the code is compiled in real-time, on each page load. In most cases, this is fine, however, if you have a major version mismatch (Example: Basic V9 + Pro V8), expect to see errors in the system. 

The compiled code acts as a polyfill between major versions, but once the developer mode is enabled, this polyfill file is no longer in use. Furthermore, deactivating developer mode will not restore the original code but instead uses the latest compiled version. 

For this reason, if you are a developer working towards contributing to our core, please reach out to us here: https://www.wpgmaps.com/contact-us/ - So that we can get you set up with a developer copy of the latest major Pro versions. We simply ask that you contribute back to core in exchange for the license. 

## Where are your developer docs?
At this stage (2022-06-24) we are in the process of creating more fully fledged V9 developer documentation. This will live here in the future: https://docs.wpgmaps.com/

Keep an eye on that area in the future to learn more about Developer Hooks, JavaScript events, and guides on extending our core code! 

## I am a developer of plugin/theme and would like to discuss integration
Awesome! Reach out to us on: https://www.wpgmaps.com/contact-us/ - Ask for a lead developer, and let's chat shop. 

--

Thank you all for your time and contirbutions, they are appreciated!
