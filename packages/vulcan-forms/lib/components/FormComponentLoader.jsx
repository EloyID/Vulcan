import React from 'react';
import { Utils, Components, registerComponent } from 'meteor/vulcan:core';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

const hasQueryKeyword = q => q.trim().substr(0, 5) === 'query';

const FormComponentLoader = props => {
  const { name, query, children, options, value } = props;
  let loading = false,
    error,
    data;

  // if query is a function, execute it
  const queryText = typeof query === 'function' ? query({ value }) : query;

  if (queryText) {
    // if queryText exists or query function returned something, execute query
    // use field's `query` property to load field-specific data
    // pass current field value as variable to the query just in case
    // for legacy reasons, also handle case where only query fragment is specified
    const formComponentQueryText = hasQueryKeyword(queryText) ? queryText : `query FormComponent${Utils.capitalize(name)}Query {${queryText}}`;
    const formComponentQuery = gql(formComponentQueryText);
    const queryResult = useQuery(formComponentQuery, { variables: { value } });
    loading = queryResult.loading;
    error = queryResult.error;
    data = queryResult.data;
    if (error) {
      throw new Error(error);
    }
  }

  // pass newly loaded data (and options if needed) to child component
  const extraProps = { data, queryData: data, queryError: error, queryLoading: loading };
  if (typeof options === 'function') {
    extraProps.optionsFunction = options;
    extraProps.options = options.call({}, { ...props, data });
  }

  const fci = React.cloneElement(children, extraProps);

  return <div className="form-component-loader">{loading ? <Components.Loading /> : fci}</div>;
};

FormComponentLoader.propTypes = {};
registerComponent({
  name: 'FormComponentLoader',
  component: FormComponentLoader,
});