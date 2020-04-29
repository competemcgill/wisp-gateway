function introspectAccessToken(r) {
    r.log("OAuth sending introspection request with token: " + r.variables.access_token)
    r.subrequest("/_oauth2_send_introspection_request", "token=" + r.variables.access_token,
        function (reply) {
            if (reply.status != 200) {
                r.error("OAuth unexpected response from authorization server (HTTP " + reply.status + "). " + reply.body);
                r.return(401);
            }

            try {
                r.log("OAuth token introspection response: " + reply.responseBody)
                var response = JSON.parse(reply.responseBody);
                if (response.active == true) {
                    r.warn("OAuth token introspection found ACTIVE token");
                    for (var p in response) {
                        if (!response.hasOwnProperty(p)) continue;
                        r.log("OAuth token value " + p + ": " + response[p]);
                        r.headersOut['token-' + p] = response[p];
                    }
                    r.status = 204;
                    r.sendHeader();
                    r.finish();
                } else {
                    r.warn("OAuth token introspection found inactive token");
                    r.return(401);
                }
            } catch (e) {
                r.error("OAuth token introspection response is not JSON: " + reply.body);
                r.return(401);
            }
        }
    );
    r.return(401);
}
